/**
 * 文件说明：回访服务。
 * 功能说明：提供回访列表、详情、新增和更新能力，并同步刷新客户和订单的跟进状态。
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
import { CreateFollowupDto } from './dto/create-followup.dto';
import { UpdateFollowupDto } from './dto/update-followup.dto';

@Injectable()
export class FollowupsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly tasksService: TasksService,
  ) {}

  findAll(keyword?: string) {
    const where: Prisma.FollowupWhereInput | undefined = keyword
      ? {
          OR: [
            { followupNo: { contains: keyword, mode: 'insensitive' } },
            { customer: { name: { contains: keyword, mode: 'insensitive' } } },
            { customer: { customerNo: { contains: keyword, mode: 'insensitive' } } },
            { order: { orderNo: { contains: keyword, mode: 'insensitive' } } },
          ],
        }
      : undefined;

    return this.prisma.followup.findMany({
      where,
      include: {
        customer: true,
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const followup = await this.prisma.followup.findUnique({
      where: { id },
      include: {
        customer: true,
        order: true,
      },
    });

    if (!followup) {
      throw new NotFoundException('回访记录不存在');
    }

    return followup;
  }

  async create(dto: CreateFollowupDto, operatorId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        customer: true,
      },
    });

    if (!order) {
      throw new NotFoundException('关联订单不存在');
    }

    return this.prisma.$transaction(async (tx) => {
      const followup = await tx.followup.create({
        data: {
          followupNo: this.generateFollowupNo(),
          orderId: order.id,
          customerId: order.customerId,
          shippedAt: order.shippedAt,
          signedAt: order.signedAt,
          firstFollowupAt: dto.firstFollowupAt ? new Date(dto.firstFollowupAt) : null,
          firstResult: dto.firstResult,
          secondFollowupAt: dto.secondFollowupAt ? new Date(dto.secondFollowupAt) : null,
          secondResult: dto.secondResult,
          thirdFollowupAt: dto.thirdFollowupAt ? new Date(dto.thirdFollowupAt) : null,
          thirdResult: dto.thirdResult,
          satisfactionScore: dto.satisfactionScore,
          isRepurchaseFit: dto.isRepurchaseFit ?? false,
          expectedRepurchaseAt: dto.expectedRepurchaseAt
            ? new Date(dto.expectedRepurchaseAt)
            : null,
          hasRepurchase: dto.hasRepurchase ?? false,
          convertedToMember: dto.convertedToMember ?? false,
          hasPartnerIntent: dto.hasPartnerIntent ?? false,
          responsibleId: operatorId,
          remarks: dto.remarks,
          createdBy: operatorId,
        },
        include: {
          customer: true,
          order: true,
        },
      });

      await this.syncLinkedStatus(tx, followup.id);
      await this.auditService.log({
        module: 'followups',
        bizType: 'followup',
        bizId: followup.id,
        action: 'create',
        changeSummary: '新增回访记录',
        afterData: followup,
        operatorId,
      });
      await this.syncTasks(followup, operatorId);
      return followup;
    });
  }

  async update(id: string, dto: UpdateFollowupDto) {
    const existing = await this.prisma.followup.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('回访记录不存在');
    }

    return this.prisma.$transaction(async (tx) => {
      const followup = await tx.followup.update({
        where: { id },
        data: {
          firstFollowupAt: dto.firstFollowupAt ? new Date(dto.firstFollowupAt) : undefined,
          firstResult: dto.firstResult,
          secondFollowupAt: dto.secondFollowupAt ? new Date(dto.secondFollowupAt) : undefined,
          secondResult: dto.secondResult,
          thirdFollowupAt: dto.thirdFollowupAt ? new Date(dto.thirdFollowupAt) : undefined,
          thirdResult: dto.thirdResult,
          satisfactionScore: dto.satisfactionScore,
          isRepurchaseFit: dto.isRepurchaseFit,
          expectedRepurchaseAt: dto.expectedRepurchaseAt
            ? new Date(dto.expectedRepurchaseAt)
            : undefined,
          hasRepurchase: dto.hasRepurchase,
          convertedToMember: dto.convertedToMember,
          hasPartnerIntent: dto.hasPartnerIntent,
          remarks: dto.remarks,
        },
        include: {
          customer: true,
          order: true,
        },
      });

      await this.syncLinkedStatus(tx, id);
      await this.auditService.log({
        module: 'followups',
        bizType: 'followup',
        bizId: followup.id,
        action: 'update',
        changeSummary: '编辑回访记录',
        beforeData: existing,
        afterData: followup,
      });
      await this.syncTasks(followup);
      return followup;
    });
  }

  private async syncTasks(
    followup: {
      id: string;
      orderId: string;
      customerId: string;
      followupNo: string;
      shippedAt: Date | null;
      signedAt: Date | null;
      firstFollowupAt: Date | null;
      firstResult: string | null;
      secondFollowupAt: Date | null;
      secondResult: string | null;
      thirdFollowupAt: Date | null;
      thirdResult: string | null;
      isRepurchaseFit: boolean;
      hasRepurchase: boolean;
      convertedToMember: boolean;
      hasPartnerIntent: boolean;
      expectedRepurchaseAt: Date | null;
    },
    operatorId?: string,
  ) {
    const hasFirstStage = Boolean(followup.firstFollowupAt || followup.firstResult);
    const hasSecondStage = Boolean(followup.secondFollowupAt || followup.secondResult);
    const hasThirdStage = Boolean(followup.thirdFollowupAt || followup.thirdResult);

    if (!hasFirstStage) {
      const dueAt = followup.shippedAt ? new Date(followup.shippedAt) : new Date();
      dueAt.setDate(dueAt.getDate() + 1);
      await this.tasksService.ensureTask({
        taskType: 'FOLLOWUP_PENDING',
        title: `第一次回访：${followup.followupNo}`,
        description: '发货后尽快确认客户是否收到、是否需要基础指导。',
        priority: 2,
        sourceType: 'order',
        sourceId: followup.orderId,
        dueAt,
        createdBy: operatorId,
        payload: {
          followupId: followup.id,
          customerId: followup.customerId,
          stage: 'first',
        },
      });
    } else if (!hasSecondStage) {
      const dueAt = followup.signedAt ? new Date(followup.signedAt) : new Date();
      dueAt.setDate(dueAt.getDate() + 1);
      await this.tasksService.ensureTask({
        taskType: 'FOLLOWUP_PENDING',
        title: `第二次回访：${followup.followupNo}`,
        description: '签收后继续回访，确认客户是否开始使用、是否存在售后问题。',
        priority: 2,
        sourceType: 'order',
        sourceId: followup.orderId,
        dueAt,
        createdBy: operatorId,
        payload: {
          followupId: followup.id,
          customerId: followup.customerId,
          stage: 'second',
        },
      });
    } else if (!hasThirdStage) {
      const dueAt = followup.secondFollowupAt
        ? new Date(followup.secondFollowupAt)
        : followup.signedAt
          ? new Date(followup.signedAt)
          : new Date();
      dueAt.setDate(dueAt.getDate() + 3);
      await this.tasksService.ensureTask({
        taskType: 'FOLLOWUP_PENDING',
        title: `第三次回访：${followup.followupNo}`,
        description: '使用后再次回访，沉淀满意度、复购判断和会员/伙伴机会。',
        priority: 2,
        sourceType: 'order',
        sourceId: followup.orderId,
        dueAt,
        createdBy: operatorId,
        payload: {
          followupId: followup.id,
          customerId: followup.customerId,
          stage: 'third',
        },
      });
    } else {
      await this.tasksService.closeActiveTasks('FOLLOWUP_PENDING', 'order', followup.orderId);
    }

    if (followup.isRepurchaseFit && !followup.hasRepurchase) {
      await this.tasksService.ensureTask({
        taskType: 'REPURCHASE_REVIEW',
        title: `审核复购机会：${followup.followupNo}`,
        description: '客户已具备复购条件，请确认推荐产品和跟进时间。',
        priority: 2,
        sourceType: 'followup',
        sourceId: followup.id,
        dueAt: followup.expectedRepurchaseAt,
        createdBy: operatorId,
        payload: {
          followupId: followup.id,
          customerId: followup.customerId,
          orderId: followup.orderId,
        },
      });
    } else {
      await this.tasksService.closeActiveTasks('REPURCHASE_REVIEW', 'followup', followup.id);
    }

    if (followup.convertedToMember) {
      await this.tasksService.ensureTask({
        taskType: 'MEMBER_REVIEW',
        title: `审核会员转化：${followup.followupNo}`,
        description: '客户满足会员转化条件，请确认是否转为会员。',
        priority: 2,
        sourceType: 'followup',
        sourceId: followup.id,
        createdBy: operatorId,
        payload: {
          followupId: followup.id,
          customerId: followup.customerId,
        },
      });
    } else {
      await this.tasksService.closeActiveTasks('MEMBER_REVIEW', 'followup', followup.id);
    }

    if (followup.hasPartnerIntent) {
      await this.tasksService.ensureTask({
        taskType: 'PARTNER_REVIEW',
        title: `审核伙伴机会：${followup.followupNo}`,
        description: '客户存在代理/分销意向，请确认是否转为伙伴。',
        priority: 2,
        sourceType: 'followup',
        sourceId: followup.id,
        createdBy: operatorId,
        payload: {
          followupId: followup.id,
          customerId: followup.customerId,
        },
      });
    } else {
      await this.tasksService.closeActiveTasks('PARTNER_REVIEW', 'followup', followup.id);
    }
  }

  private async syncLinkedStatus(tx: Prisma.TransactionClient, followupId: string) {
    const followup = await tx.followup.findUnique({
      where: { id: followupId },
    });

    if (!followup) {
      throw new NotFoundException('回访记录不存在');
    }

    const hasAnyFollowup = Boolean(
      followup.firstFollowupAt ||
        followup.secondFollowupAt ||
        followup.thirdFollowupAt ||
        followup.firstResult ||
        followup.secondResult ||
        followup.thirdResult,
    );

    const nextFollowupAt =
      followup.expectedRepurchaseAt ??
      followup.thirdFollowupAt ??
      followup.secondFollowupAt ??
      followup.firstFollowupAt ??
      null;

    await tx.order.update({
      where: { id: followup.orderId },
      data: {
        isFollowedUp: hasAnyFollowup,
        followupStatus: hasAnyFollowup ? '回访中' : '未开始',
        isRepurchaseCandidate: followup.isRepurchaseFit,
        isMemberCandidate: followup.convertedToMember,
        isPartnerCandidate: followup.hasPartnerIntent,
      },
    });

    await tx.customer.update({
      where: { id: followup.customerId },
      data: {
        followupStatus: hasAnyFollowup ? '回访中' : '待跟进',
        nextFollowupAt,
        hasPartnerIntent: followup.hasPartnerIntent,
        lifecycleStage: followup.isRepurchaseFit ? '可复购' : undefined,
      },
    });
  }

  private generateFollowupNo() {
    return `F${Date.now()}`;
  }
}
