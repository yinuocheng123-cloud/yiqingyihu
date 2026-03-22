/**
 * 文件说明：会员服务。
 * 功能说明：提供会员列表、详情、新增和编辑能力，并与客户数据保持同步。
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
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly tasksService: TasksService,
  ) {}

  findAll(keyword?: string) {
    const where: Prisma.MemberWhereInput | undefined = keyword
      ? {
          OR: [
            { memberNo: { contains: keyword, mode: 'insensitive' } },
            { customer: { name: { contains: keyword, mode: 'insensitive' } } },
            { customer: { customerNo: { contains: keyword, mode: 'insensitive' } } },
          ],
        }
      : undefined;

    return this.prisma.member.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            orders: {
              orderBy: {
                orderDate: 'desc',
              },
            },
            followups: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('会员不存在');
    }

    return member;
  }

  async create(dto: CreateMemberDto, operatorId?: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('关联客户不存在');
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.member.findUnique({
        where: { customerId: dto.customerId },
        include: {
          customer: true,
        },
      });

      if (existing) {
        return existing;
      }

      const member = await tx.member.create({
        data: {
          memberNo: this.generateMemberNo(),
          customerId: dto.customerId,
          joinedAt: dto.joinedAt ? new Date(dto.joinedAt) : new Date(),
          status: dto.status ?? '有效',
          level: dto.level ?? '轻会员',
          source: dto.source ?? '客户转化',
          purchaseCount: customer.purchaseCount,
          totalAmount: customer.totalAmount,
          lastOrderAt: customer.lastOrderAt,
          benefitStatus: dto.benefitStatus ?? '已开通',
          responsibleId: operatorId,
          remarks: dto.remarks,
        },
        include: {
          customer: true,
        },
      });

      await tx.customer.update({
        where: { id: dto.customerId },
        data: {
          isMember: true,
          lifecycleStage: '会员',
        },
      });

      await this.auditService.log({
        module: 'members',
        bizType: 'member',
        bizId: member.id,
        action: 'create',
        changeSummary: '客户转会员',
        afterData: member,
        operatorId,
      });

      const relatedFollowups = await tx.followup.findMany({
        where: {
          customerId: dto.customerId,
          convertedToMember: true,
        },
        select: {
          id: true,
        },
      });

      for (const followup of relatedFollowups) {
        await this.tasksService.closeActiveTasks('MEMBER_REVIEW', 'followup', followup.id);
      }

      return member;
    });
  }

  async update(id: string, dto: UpdateMemberDto) {
    const existing = await this.prisma.member.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('会员不存在');
    }

    return this.prisma.$transaction(async (tx) => {
      const member = await tx.member.update({
        where: { id },
        data: {
          joinedAt: dto.joinedAt ? new Date(dto.joinedAt) : undefined,
          status: dto.status,
          level: dto.level,
          source: dto.source,
          benefitStatus: dto.benefitStatus,
          remarks: dto.remarks,
        },
        include: {
          customer: true,
        },
      });

      if (dto.status) {
        await tx.customer.update({
          where: { id: existing.customerId },
          data: {
            isMember: dto.status !== '失效',
            lifecycleStage: dto.status !== '失效' ? '会员' : '已首购',
          },
        });
      }

      await this.auditService.log({
        module: 'members',
        bizType: 'member',
        bizId: member.id,
        action: 'update',
        changeSummary: '编辑会员信息',
        beforeData: existing,
        afterData: member,
      });

      return member;
    });
  }

  private generateMemberNo() {
    return `M${Date.now()}`;
  }
}
