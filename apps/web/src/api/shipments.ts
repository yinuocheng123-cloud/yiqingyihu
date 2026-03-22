/**
 * 文件说明：发货模块接口封装。
 * 功能说明：集中管理发货记录的新增和编辑接口。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import { apiClient } from './client';
import type { Shipment, ShipmentPayload } from '../types/shipment';

export async function createShipment(payload: ShipmentPayload) {
  const response = await apiClient.post<Shipment>('/shipments', payload);
  return response.data;
}

export async function updateShipment(id: string, payload: ShipmentPayload) {
  const response = await apiClient.patch<Shipment>(`/shipments/${id}`, payload);
  return response.data;
}
