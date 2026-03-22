/**
 * 文件说明：任务服务。
 * 功能说明：提供统一待办收口、自动建任务、审核、关闭和任务安排更新能力。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：输入类型定义
 *   第三部分：服务实现
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

interface EnsureTaskInput {
  taskType: string;
  title: string;
  description?: string;
  priority?: number;
  sourceType: string;
  sourceId: string;
  payload?: Record<string, unknown>;
  dueAt?: Date | null;
  responsibleId?: string;
  createdBy?: string;
}

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  findInbox(query?: QueryTasksDto) {
    const where: Prisma.TaskWhereInput = {
      status: query?.status
        ? query.status
        : {
            in: ['OPEN', 'IN_REVIEW'],
          },
      taskType: query?.taskType || undefined,
      responsibleId: query?.responsibleId || undefined,
      priority: query?.priority || undefined,
      OR: query?.keyword
        ? [
            { title: { contains: query.keyword, mode: 'insensitive' } },
            { taskNo: { contains: query.keyword, mode: 'insensitive' } },
          ]
        : undefined,
    };

    return this.prisma.task.findMany({
      where,
      include: {
        responsible: {
          select: {
            id: true,
            realName: true,
          },
        },
      },
      orderBy: [{ priority: 'asc' }, { dueAt: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async updateStatus(id: string, status: 'IN_REVIEW' | 'DONE' | 'CANCELLED', note?: string) {
    const existing = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('任务不存在');
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        status,
        reviewedAt: status === 'IN_REVIEW' ? new Date() : existing.reviewedAt,
        closedAt: status === 'DONE' || status === 'CANCELLED' ? new Date() : null,
        description: note ? `${existing.description ?? ''}\n${note}`.trim() : existing.description,
      },
      include: {
        responsible: {
          select: {
            id: true,
            realName: true,
          },
        },
      },
    });

    await this.auditService.log({
      module: 'tasks',
      bizType: 'task',
      bizId: task.id,
      action: 'update-status',
      changeSummary: `任务状态更新为 ${status}`,
      beforeData: existing,
      afterData: task,
    });

    return task;
  }

  async updateTask(id: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('任务不存在');
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        responsibleId: dto.responsibleId === '' ? null : dto.responsibleId,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : dto.dueAt === '' ? null : undefined,
        priority: dto.priority ?? undefined,
        description: dto.note ? `${existing.description ?? ''}\n${dto.note}`.trim() : existing.description,
      },
      include: {
        responsible: {
          select: {
            id: true,
            realName: true,
          },
        },
      },
    });

    await this.auditService.log({
      module: 'tasks',
      bizType: 'task',
      bizId: task.id,
      action: 'update',
      changeSummary: '更新任务负责人、到期时间或备注',
      beforeData: existing,
      afterData: task,
      operatorId: dto.responsibleId,
    });

    return task;
  }

  async ensureTask(input: EnsureTaskInput) {
    const existing = await this.prisma.task.findFirst({
      where: {
        taskType: input.taskType,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        status: {
          in: ['OPEN', 'IN_REVIEW'],
        },
      },
      include: {
        responsible: {
          select: {
            id: true,
            realName: true,
          },
        },
      },
    });

    if (existing) {
      return existing;
    }

    const resolvedResponsibleId = input.responsibleId ?? (await this.resolveDefaultResponsibleId(input));

    const task = await this.prisma.task.create({
      data: {
        taskNo: this.generateTaskNo(),
        taskType: input.taskType,
        title: input.title,
        description: input.description,
        priority: input.priority ?? 3,
        sourceType: input.sourceType,
        sourceId: input.sourceId,
        payload: input.payload as Prisma.InputJsonValue | undefined,
        dueAt: input.dueAt,
        responsibleId: resolvedResponsibleId,
        createdBy: input.createdBy,
      },
      include: {
        responsible: {
          select: {
            id: true,
            realName: true,
          },
        },
      },
    });

    await this.auditService.log({
      module: 'tasks',
      bizType: 'task',
      bizId: task.id,
      action: 'create',
      changeSummary: `自动创建任务 ${task.taskType}`,
      afterData: task,
      operatorId: input.createdBy,
    });

    return task;
  }

  async closeActiveTasks(taskType: string, sourceType: string, sourceId: string) {
    await this.prisma.task.updateMany({
      where: {
        taskType,
        sourceType,
        sourceId,
        status: {
          in: ['OPEN', 'IN_REVIEW'],
        },
      },
      data: {
        status: 'DONE',
        closedAt: new Date(),
      },
    });
  }

  async bulkUpdate(ids: string[], status: 'IN_REVIEW' | 'DONE' | 'CANCELLED') {
    await this.prisma.task.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        status,
        reviewedAt: status === 'IN_REVIEW' ? new Date() : undefined,
        closedAt: status === 'DONE' || status === 'CANCELLED' ? new Date() : null,
      },
    });

    return this.findInbox();
  }

  private generateTaskNo() {
    return `T${Date.now()}`;
  }

  private async resolveDefaultResponsibleId(input: EnsureTaskInput) {
    if (input.sourceType === 'customer') {
      const customer = await this.prisma.customer.findUnique({
        where: { id: input.sourceId },
        select: { ownerId: true },
      });
      return customer?.ownerId ?? undefined;
    }

    if (input.sourceType === 'order') {
      const order = await this.prisma.order.findUnique({
        where: { id: input.sourceId },
        select: {
          shipmentOwnerId: true,
          customer: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      if (!order) {
        return undefined;
      }

      // 发货类任务优先给发货责任人，其余订单类任务优先沿用客户负责人。
      if (input.taskType === 'SHIPMENT_PENDING' && order.shipmentOwnerId) {
        return order.shipmentOwnerId;
      }

      return order.customer.ownerId ?? order.shipmentOwnerId ?? undefined;
    }

    if (input.sourceType === 'followup') {
      const followup = await this.prisma.followup.findUnique({
        where: { id: input.sourceId },
        select: {
          responsibleId: true,
          customer: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      if (!followup) {
        return undefined;
      }

      return followup.responsibleId ?? followup.customer.ownerId ?? undefined;
    }

    return undefined;
  }
}
