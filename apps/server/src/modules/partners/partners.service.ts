/**
 * 文件说明：伙伴服务。
 * 功能说明：提供伙伴列表、详情、新增和编辑能力，并同步客户代理意向状态。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：服务实现
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { TasksService } from '../tasks/tasks.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';

@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly tasksService: TasksService,
  ) {}

  findAll(keyword?: string) {
    const where: Prisma.PartnerWhereInput | undefined = keyword
      ? {
          OR: [
            { partnerNo: { contains: keyword, mode: 'insensitive' } },
            { name: { contains: keyword, mode: 'insensitive' } },
            { mobile: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    return this.prisma.partner.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(dto: CreatePartnerDto, operatorId?: string) {
    if (dto.customerId) {
      const existing = await this.prisma.partner.findUnique({
        where: { customerId: dto.customerId },
        include: { customer: true },
      });
      if (existing) {
        return existing;
      }
    }

    const customer = dto.customerId
      ? await this.prisma.customer.findUnique({ where: { id: dto.customerId } })
      : null;

    return this.prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: {
          partnerNo: this.generatePartnerNo(),
          customerId: dto.customerId,
          name: dto.name,
          mobile: dto.mobile,
          wechatId: dto.wechatId,
          region: dto.region,
          identityType: dto.identityType,
          sourceType: dto.sourceType,
          status: dto.status ?? '意向中',
          dealSummary: dto.dealSummary,
          attendedTraining: dto.attendedTraining ?? false,
          trainingAt: dto.trainingAt ? new Date(dto.trainingAt) : null,
          activationStatus: dto.activationStatus ?? '未激活',
          responsibleId: operatorId,
          remarks: dto.remarks,
          createdBy: operatorId,
        },
        include: {
          customer: true,
        },
      });

      if (customer) {
        await tx.customer.update({
          where: { id: customer.id },
          data: {
            hasPartnerIntent: true,
            lifecycleStage: '代理意向',
          },
        });
      }

      await this.auditService.log({
        module: 'partners',
        bizType: 'partner',
        bizId: partner.id,
        action: 'create',
        changeSummary: '新增伙伴档案',
        afterData: partner,
        operatorId,
      });

      if (dto.customerId) {
        const relatedFollowups = await tx.followup.findMany({
          where: {
            customerId: dto.customerId,
            hasPartnerIntent: true,
          },
          select: {
            id: true,
          },
        });

        for (const followup of relatedFollowups) {
          await this.tasksService.closeActiveTasks('PARTNER_REVIEW', 'followup', followup.id);
        }
      }

      return partner;
    });
  }

  async update(id: string, dto: UpdatePartnerDto) {
    const existing = await this.prisma.partner.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('伙伴不存在');
    }

    return this.prisma.$transaction(async (tx) => {
      const partner = await tx.partner.update({
        where: { id },
        data: {
          name: dto.name,
          mobile: dto.mobile,
          wechatId: dto.wechatId,
          region: dto.region,
          identityType: dto.identityType,
          sourceType: dto.sourceType,
          status: dto.status,
          dealSummary: dto.dealSummary,
          attendedTraining: dto.attendedTraining,
          trainingAt: dto.trainingAt ? new Date(dto.trainingAt) : undefined,
          activationStatus: dto.activationStatus,
          remarks: dto.remarks,
        },
        include: {
          customer: true,
        },
      });

      if (existing.customerId) {
        await tx.customer.update({
          where: { id: existing.customerId },
          data: {
            hasPartnerIntent: partner.status !== '暂停合作',
            lifecycleStage: partner.status !== '暂停合作' ? '代理意向' : undefined,
          },
        });
      }

      await this.auditService.log({
        module: 'partners',
        bizType: 'partner',
        bizId: partner.id,
        action: 'update',
        changeSummary: '编辑伙伴档案',
        beforeData: existing,
        afterData: partner,
      });

      return partner;
    });
  }

  private generatePartnerNo() {
    return `P${Date.now()}`;
  }
}
