/**
 * 文件说明：客户服务。
 * 功能说明：提供客户列表、详情、新增和编辑能力，作为业务主链路的起点。
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
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly tasksService: TasksService,
  ) {}

  findAll(keyword?: string) {
    const where: Prisma.CustomerWhereInput | undefined = keyword
      ? {
          OR: [
            { customerNo: { contains: keyword, mode: 'insensitive' } },
            { name: { contains: keyword, mode: 'insensitive' } },
            { mobile: { contains: keyword, mode: 'insensitive' } },
            { wechatId: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    return this.prisma.customer.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        followups: {
          include: {
            order: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    return customer;
  }

  async create(dto: CreateCustomerDto, operatorId?: string) {
    const customer = await this.prisma.customer.create({
      data: {
        customerNo: this.generateCustomerNo(),
        name: dto.name,
        mobile: dto.mobile,
        wechatId: dto.wechatId,
        wecomNickname: dto.wecomNickname,
        sourceChannel: dto.sourceChannel,
        customerType: dto.customerType,
        lifecycleStage: dto.lifecycleStage ?? '新线索',
        identityTag: dto.identityTag,
        followupStatus: dto.followupStatus ?? '待跟进',
        nextFollowupAt: dto.nextFollowupAt ? new Date(dto.nextFollowupAt) : null,
        hasPartnerIntent: dto.hasPartnerIntent ?? false,
        isEnterprise: dto.isEnterprise ?? false,
        remarks: dto.remarks,
        ownerId: operatorId,
        createdBy: operatorId,
        firstContactAt: new Date(),
      },
    });

    await this.auditService.log({
      module: 'customers',
      bizType: 'customer',
      bizId: customer.id,
      action: 'create',
      changeSummary: '新增客户建档',
      afterData: customer,
      operatorId,
    });

    await this.tasksService.ensureTask({
      taskType: 'LEAD_REVIEW',
      title: `审核新线索：${customer.name}`,
      description: '新客户已建档，请确认来源、标签和首次跟进动作。',
      priority: 2,
      sourceType: 'customer',
      sourceId: customer.id,
      dueAt: customer.nextFollowupAt ?? new Date(),
      responsibleId: customer.ownerId ?? undefined,
      createdBy: operatorId,
      payload: {
        customerId: customer.id,
        customerNo: customer.customerNo,
      },
    });

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const before = await this.ensureExists(id);

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        name: dto.name,
        mobile: dto.mobile,
        wechatId: dto.wechatId,
        wecomNickname: dto.wecomNickname,
        sourceChannel: dto.sourceChannel,
        customerType: dto.customerType,
        lifecycleStage: dto.lifecycleStage,
        identityTag: dto.identityTag,
        followupStatus: dto.followupStatus,
        nextFollowupAt: dto.nextFollowupAt ? new Date(dto.nextFollowupAt) : undefined,
        hasPartnerIntent: dto.hasPartnerIntent,
        isEnterprise: dto.isEnterprise,
        remarks: dto.remarks,
      },
    });

    await this.auditService.log({
      module: 'customers',
      bizType: 'customer',
      bizId: customer.id,
      action: 'update',
      changeSummary: '编辑客户信息',
      beforeData: before,
      afterData: customer,
    });

    return customer;
  }

  private async ensureExists(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    return customer;
  }

  private generateCustomerNo() {
    return `C${Date.now()}`;
  }
}
