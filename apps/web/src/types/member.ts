/**
 * 文件说明：会员模块类型定义。
 * 功能说明：统一会员列表、详情和表单的数据结构。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
import type { Customer } from './customer';

export interface Member {
  id: string;
  memberNo: string;
  customerId: string;
  joinedAt: string;
  status: string;
  level?: string | null;
  source?: string | null;
  purchaseCount: number;
  totalAmount: number;
  lastOrderAt?: string | null;
  benefitStatus?: string | null;
  remarks?: string | null;
  customer: Customer;
}

export interface MemberPayload {
  customerId: string;
  joinedAt?: string;
  status?: string;
  level?: string;
  source?: string;
  benefitStatus?: string;
  remarks?: string;
}
