/**
 * 文件说明：订单模块类型定义。
 * 功能说明：统一订单列表、详情和表单的数据结构。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
import type { Customer } from './customer';
import type { Shipment } from './shipment';

export interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  orderDate: string;
  orderChannel: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string | null;
  shipmentMode?: string | null;
  shipmentStatus: string;
  signStatus: string;
  aftersaleStatus: string;
  remarks?: string | null;
  customer: Customer;
  shipments?: Shipment[];
}

export interface OrderPayload {
  customerId: string;
  orderDate: string;
  orderChannel: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  shipmentMode?: string;
  shipmentStatus?: string;
  signStatus?: string;
  aftersaleStatus?: string;
  remarks?: string;
}
