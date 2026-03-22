/**
 * 文件说明：伙伴模块类型定义。
 * 功能说明：统一伙伴列表和表单的数据结构。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
import type { Customer } from './customer';

export interface Partner {
  id: string;
  partnerNo: string;
  customerId?: string | null;
  name: string;
  mobile?: string | null;
  wechatId?: string | null;
  region?: string | null;
  identityType: string;
  sourceType: string;
  status: string;
  dealSummary?: string | null;
  attendedTraining: boolean;
  trainingAt?: string | null;
  activationStatus: string;
  remarks?: string | null;
  customer?: Customer | null;
}

export interface PartnerPayload {
  customerId?: string;
  name: string;
  mobile?: string;
  wechatId?: string;
  region?: string;
  identityType: string;
  sourceType: string;
  status?: string;
  dealSummary?: string;
  attendedTraining?: boolean;
  trainingAt?: string;
  activationStatus?: string;
  remarks?: string;
}
