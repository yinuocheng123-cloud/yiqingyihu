/**
 * 文件说明：订单服务。
 * 功能说明：提供订单列表、详情、新增和编辑能力，并同步更新客户消费汇总。
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
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly tasksService: TasksService,
  ) {}

  findAll(keyword?: string) {
    const where: Prisma.OrderWhereInput | undefined = keyword
      ? {
          OR: [
            { orderNo: { contains: keyword, mode: 'insensitive' } },
            { orderChannel: { contains: keyword, mode: 'insensitive' } },
            { customer: { name: { contains: keyword, mode: 'insensitive' } } },
            { customer: { customerNo: { contains: keyword, mode: 'insensitive' } } },
          ],
        }
      : undefined;

    return this.prisma.order.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        shipments: true,
        followups: true,
      },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    return order;
  }

  async create(dto: CreateOrderDto, operatorId?: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('关联客户不存在');
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNo: this.generateOrderNo(),
          customerId: dto.customerId,
          orderDate: new Date(dto.orderDate),
          orderChannel: dto.orderChannel,
          totalAmount: dto.totalAmount,
          paymentStatus: dto.paymentStatus,
          paymentMethod: dto.paymentMethod,
          shipmentMode: dto.shipmentMode,
          shipmentStatus: dto.shipmentStatus ?? '待发货',
          signStatus: dto.signStatus ?? '待签收',
          aftersaleStatus: dto.aftersaleStatus ?? '无售后',
          remarks: dto.remarks,
          createdBy: operatorId,
        },
        include: {
          customer: true,
        },
      });

      await this.refreshCustomerMetrics(tx, dto.customerId);
      await this.auditService.log({
        module: 'orders',
        bizType: 'order',
        bizId: order.id,
        action: 'create',
        changeSummary: '新增订单',
        afterData: order,
        operatorId,
      });

      await this.tasksService.ensureTask({
        taskType: 'ORDER_REVIEW',
        title: `审核新订单：${order.orderNo}`,
        description: '请确认收款、渠道与订单信息是否完整。',
        priority: 1,
        sourceType: 'order',
        sourceId: order.id,
        dueAt: order.orderDate,
        createdBy: operatorId,
        payload: {
          orderId: order.id,
          orderNo: order.orderNo,
          customerId: order.customerId,
        },
      });

      await this.tasksService.ensureTask({
        taskType: 'SHIPMENT_PENDING',
        title: `待发货：${order.orderNo}`,
        description: '订单已创建，请安排发货并录入物流单号。',
        priority: 1,
        sourceType: 'order',
        sourceId: order.id,
        dueAt: new Date(order.orderDate),
        createdBy: operatorId,
        payload: {
          orderId: order.id,
          orderNo: order.orderNo,
          customerId: order.customerId,
        },
      });
      return order;
    });
  }

  async update(id: string, dto: UpdateOrderDto) {
    const existing = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('订单不存在');
    }

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: {
          orderDate: dto.orderDate ? new Date(dto.orderDate) : undefined,
          orderChannel: dto.orderChannel,
          totalAmount: dto.totalAmount,
          paymentStatus: dto.paymentStatus,
          paymentMethod: dto.paymentMethod,
          shipmentMode: dto.shipmentMode,
          shipmentStatus: dto.shipmentStatus,
          signStatus: dto.signStatus,
          aftersaleStatus: dto.aftersaleStatus,
          remarks: dto.remarks,
        },
        include: {
          customer: true,
        },
      });

      await this.refreshCustomerMetrics(tx, existing.customerId);
      await this.auditService.log({
        module: 'orders',
        bizType: 'order',
        bizId: order.id,
        action: 'update',
        changeSummary: '编辑订单',
        beforeData: existing,
        afterData: order,
      });
      return order;
    });
  }

  private async refreshCustomerMetrics(tx: Prisma.TransactionClient, customerId: string) {
    const customer = await tx.customer.findUnique({
      where: { id: customerId },
    });

    const aggregate = await tx.order.aggregate({
      where: {
        customerId,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
      _max: {
        orderDate: true,
      },
      _min: {
        orderDate: true,
      },
    });

    const purchaseCount = aggregate._count.id ?? 0;
    const totalAmount = aggregate._sum.totalAmount ?? 0;
    const firstOrderAt = aggregate._min.orderDate ?? null;
    const lastOrderAt = aggregate._max.orderDate ?? null;

    await tx.customer.update({
      where: { id: customerId },
      data: {
        purchaseCount,
        totalAmount,
        firstOrderAt,
        lastOrderAt,
        lifecycleStage:
          customer?.isMember ? '会员' : purchaseCount > 0 ? '已首购' : '新线索',
      },
    });
  }

  private generateOrderNo() {
    return `O${Date.now()}`;
  }
}
