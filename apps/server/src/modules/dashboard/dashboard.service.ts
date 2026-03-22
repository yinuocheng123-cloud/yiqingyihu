/**
 * 文件说明：看板服务。
 * 功能说明：提供首页经营概览和待办提醒，方便个人团队直接日常使用。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：服务实现
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      customerCount,
      purchasedCustomers,
      repurchaseCustomers,
      memberCount,
      partnerIntentCount,
      orderCount,
      totalRevenue,
      followupCount,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({
        where: {
          purchaseCount: {
            gt: 0,
          },
        },
      }),
      this.prisma.customer.count({
        where: {
          purchaseCount: {
            gt: 1,
          },
        },
      }),
      this.prisma.member.count(),
      this.prisma.customer.count({
        where: {
          hasPartnerIntent: true,
        },
      }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
      this.prisma.followup.count(),
    ]);

    return {
      customerCount,
      purchasedCustomers,
      repurchaseCustomers,
      memberCount,
      partnerIntentCount,
      orderCount,
      totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
      followupCount,
    };
  }

  async getReminders() {
    const now = new Date();
    const nextSevenDays = new Date(now);
    nextSevenDays.setDate(now.getDate() + 7);

    const [pendingCustomers, pendingFollowups, pendingRepurchases, pendingMembers] =
      await Promise.all([
        this.prisma.customer.findMany({
          where: {
            OR: [
              { followupStatus: '待跟进' },
              {
                nextFollowupAt: {
                  lte: nextSevenDays,
                },
              },
            ],
          },
          orderBy: [{ nextFollowupAt: 'asc' }, { createdAt: 'desc' }],
          take: 8,
        }),
        this.prisma.order.findMany({
          where: {
            OR: [
              { isFollowedUp: false },
              { followupStatus: '未开始' },
              { followupStatus: '回访中' },
            ],
          },
          include: {
            customer: true,
          },
          orderBy: {
            orderDate: 'desc',
          },
          take: 8,
        }),
        this.prisma.followup.findMany({
          where: {
            isRepurchaseFit: true,
            hasRepurchase: false,
            expectedRepurchaseAt: {
              lte: nextSevenDays,
            },
          },
          include: {
            customer: true,
            order: true,
          },
          orderBy: {
            expectedRepurchaseAt: 'asc',
          },
          take: 8,
        }),
        this.prisma.followup.findMany({
          where: {
            convertedToMember: true,
            customer: {
              isMember: false,
            },
          },
          include: {
            customer: true,
            order: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          take: 8,
        }),
      ]);

    return {
      pendingCustomers,
      pendingFollowups,
      pendingRepurchases,
      pendingMembers,
    };
  }
}
