/**
 * 文件说明：发货模块类型定义。
 * 功能说明：统一发货记录展示与表单的数据结构。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
export interface Shipment {
  id: string;
  orderId: string;
  shipmentNo: string;
  logisticsCompany?: string | null;
  trackingNo?: string | null;
  shipmentMode?: string | null;
  shipmentStatus: string;
  shippedAt?: string | null;
  signedAt?: string | null;
  remarks?: string | null;
}

export interface ShipmentPayload {
  orderId: string;
  logisticsCompany?: string;
  trackingNo?: string;
  shipmentMode?: string;
  shipmentStatus?: string;
  shippedAt?: string;
  signedAt?: string;
  remarks?: string;
}
