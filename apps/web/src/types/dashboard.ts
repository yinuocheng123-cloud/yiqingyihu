/**
 * 文件说明：看板模块类型定义。
 * 功能说明：统一首页概览和提醒接口返回结构。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
export interface DashboardOverview {
  customerCount: number;
  purchasedCustomers: number;
  repurchaseCustomers: number;
  memberCount: number;
  partnerIntentCount: number;
  orderCount: number;
  totalRevenue: number;
  followupCount: number;
}

export interface ReminderCustomer {
  id: string;
  customerNo: string;
  name: string;
  followupStatus: string;
  nextFollowupAt?: string | null;
}

export interface ReminderOrder {
  id: string;
  orderNo: string;
  orderDate: string;
  followupStatus: string;
  customer: {
    id: string;
    name: string;
  };
}

export interface ReminderFollowup {
  id: string;
  followupNo: string;
  expectedRepurchaseAt?: string | null;
  customer: {
    id: string;
    name: string;
  };
  order: {
    id: string;
    orderNo: string;
  };
}

export interface DashboardReminders {
  pendingCustomers: ReminderCustomer[];
  pendingFollowups: ReminderOrder[];
  pendingRepurchases: ReminderFollowup[];
  pendingMembers: ReminderFollowup[];
}
