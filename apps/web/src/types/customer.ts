/**
 * 文件说明：客户模块类型定义。
 * 功能说明：统一客户列表与表单使用的数据结构，减少页面和接口之间的重复定义。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
export interface Customer {
  id: string;
  customerNo: string;
  name: string;
  mobile?: string | null;
  wechatId?: string | null;
  wecomNickname?: string | null;
  sourceChannel: string;
  customerType: string;
  lifecycleStage: string;
  followupStatus: string;
  nextFollowupAt?: string | null;
  isMember: boolean;
  hasPartnerIntent: boolean;
  isEnterprise: boolean;
  createdAt: string;
  remarks?: string | null;
}

export interface CustomerPayload {
  name: string;
  mobile?: string;
  wechatId?: string;
  wecomNickname?: string;
  sourceChannel: string;
  customerType: string;
  lifecycleStage?: string;
  identityTag?: string;
  followupStatus?: string;
  nextFollowupAt?: string;
  hasPartnerIntent?: boolean;
  isEnterprise?: boolean;
  remarks?: string;
}

export interface CustomerDetail extends Customer {
  totalAmount: number;
  purchaseCount: number;
  firstOrderAt?: string | null;
  lastOrderAt?: string | null;
  orders: Array<{
    id: string;
    orderNo: string;
    orderDate: string;
    orderChannel: string;
    totalAmount: number;
    paymentStatus: string;
    shipmentStatus: string;
    signStatus: string;
  }>;
  followups: Array<{
    id: string;
    followupNo: string;
    createdAt: string;
    order?: {
      id: string;
      orderNo: string;
    };
    firstResult?: string | null;
    secondResult?: string | null;
    thirdResult?: string | null;
    satisfactionScore?: number | null;
    hasRepurchase: boolean;
    isRepurchaseFit?: boolean;
  }>;
}
