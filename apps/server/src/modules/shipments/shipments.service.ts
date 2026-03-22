/**
 * 文件说明：发货服务。
 * 功能说明：提供发货记录的新增、编辑和查询，并同步订单履约状态。
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
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';

@Injectable()
export class ShipmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly tasksService: TasksService,
  ) {}

  findAll(keyword?: string) {
    const where: Prisma.ShipmentWhereInput | undefined = keyword
      ? {
          OR: [
            { shipmentNo: { contains: keyword, mode: 'insensitive' } },
            { trackingNo: { contains: keyword, mode: 'insensitive' } },
            { order: { orderNo: { contains: keyword, mode: 'insensitive' } } },
          ],
        }
      : undefined;

    return this.prisma.shipment.findMany({
      where,
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(dto: CreateShipmentDto, operatorId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException('关联订单不存在');
    }

    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          orderId: dto.orderId,
          shipmentNo: this.generateShipmentNo(),
          logisticsCompany: dto.logisticsCompany,
          trackingNo: dto.trackingNo,
          shipmentMode: dto.shipmentMode ?? order.shipmentMode,
          shipmentStatus: dto.shipmentStatus ?? '已发货',
          shippedAt: dto.shippedAt ? new Date(dto.shippedAt) : new Date(),
          signedAt: dto.signedAt ? new Date(dto.signedAt) : null,
          responsibleId: operatorId,
          remarks: dto.remarks,
        },
        include: {
          order: true,
        },
      });

      await this.syncOrderStatus(tx, shipment.orderId);
      await this.auditService.log({
        module: 'shipments',
        bizType: 'shipment',
        bizId: shipment.id,
        action: 'create',
        changeSummary: '新增发货记录',
        afterData: shipment,
        operatorId,
      });

      await this.tasksService.closeActiveTasks('SHIPMENT_PENDING', 'order', shipment.orderId);

      const followupDueAt = shipment.shippedAt ?? new Date();
      const taskDueAt = new Date(followupDueAt);
      taskDueAt.setDate(taskDueAt.getDate() + 3);
      await this.tasksService.ensureTask({
        taskType: 'FOLLOWUP_PENDING',
        title: `第一次回访：${shipment.order.orderNo}`,
        description: '订单已发货，请先完成第一次回访，确认客户是否收到并建立基础使用预期。',
        priority: 2,
        sourceType: 'order',
        sourceId: shipment.orderId,
        dueAt: taskDueAt,
        createdBy: operatorId,
        payload: {
          orderId: shipment.orderId,
        },
      });
      return shipment;
    });
  }

  async update(id: string, dto: UpdateShipmentDto) {
    const existing = await this.prisma.shipment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('发货记录不存在');
    }

    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.update({
        where: { id },
        data: {
          logisticsCompany: dto.logisticsCompany,
          trackingNo: dto.trackingNo,
          shipmentMode: dto.shipmentMode,
          shipmentStatus: dto.shipmentStatus,
          shippedAt: dto.shippedAt ? new Date(dto.shippedAt) : undefined,
          signedAt: dto.signedAt ? new Date(dto.signedAt) : undefined,
          remarks: dto.remarks,
        },
        include: {
          order: true,
        },
      });

      await this.syncOrderStatus(tx, shipment.orderId);
      await this.auditService.log({
        module: 'shipments',
        bizType: 'shipment',
        bizId: shipment.id,
        action: 'update',
        changeSummary: '编辑发货记录',
        beforeData: existing,
        afterData: shipment,
      });

      if (shipment.signedAt) {
        const repurchaseStart = new Date(shipment.signedAt);
        repurchaseStart.setDate(repurchaseStart.getDate() + 1);
        await this.tasksService.ensureTask({
          taskType: 'FOLLOWUP_PENDING',
          title: `第二次回访：${shipment.order.orderNo}`,
          description: '订单已签收，请继续回访并记录使用反馈，为复购和售后判断做准备。',
          priority: 2,
          sourceType: 'order',
          sourceId: shipment.orderId,
          dueAt: repurchaseStart,
          payload: {
            orderId: shipment.orderId,
          },
        });
      }
      return shipment;
    });
  }

  private async syncOrderStatus(tx: Prisma.TransactionClient, orderId: string) {
    const shipments = await tx.shipment.findMany({
      where: { orderId },
      orderBy: {
        shippedAt: 'desc',
      },
    });

    const latest = shipments[0];
    const signedShipment = shipments.find((item) => item.signedAt);

    await tx.order.update({
      where: { id: orderId },
      data: {
        shipmentMode: latest?.shipmentMode ?? undefined,
        shipmentStatus: latest?.shipmentStatus ?? '待发货',
        shippedAt: latest?.shippedAt ?? null,
        signStatus: signedShipment ? '已签收' : latest ? '待签收' : '待签收',
        signedAt: signedShipment?.signedAt ?? null,
      },
    });
  }

  private generateShipmentNo() {
    return `S${Date.now()}`;
  }
}
