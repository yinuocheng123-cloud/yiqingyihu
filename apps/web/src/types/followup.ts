/**
 * 文件说明：回访模块类型定义。
 * 功能说明：统一回访列表、详情和表单的数据结构。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
import type { Customer } from './customer';
import type { Order } from './order';

export interface Followup {
  id: string;
  followupNo: string;
  orderId: string;
  customerId: string;
  firstFollowupAt?: string | null;
  firstResult?: string | null;
  secondFollowupAt?: string | null;
  secondResult?: string | null;
  thirdFollowupAt?: string | null;
  thirdResult?: string | null;
  satisfactionScore?: number | null;
  isRepurchaseFit: boolean;
  expectedRepurchaseAt?: string | null;
  hasRepurchase: boolean;
  convertedToMember: boolean;
  hasPartnerIntent: boolean;
  remarks?: string | null;
  customer: Customer;
  order: Order;
}

export interface FollowupPayload {
  orderId: string;
  firstFollowupAt?: string;
  firstResult?: string;
  secondFollowupAt?: string;
  secondResult?: string;
  thirdFollowupAt?: string;
  thirdResult?: string;
  satisfactionScore?: number;
  isRepurchaseFit?: boolean;
  expectedRepurchaseAt?: string;
  hasRepurchase?: boolean;
  convertedToMember?: boolean;
  hasPartnerIntent?: boolean;
  remarks?: string;
}
