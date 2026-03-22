/**
 * 文件说明：订单模块接口封装。
 * 功能说明：集中管理订单查询和新增接口，供订单页面和客户详情复用。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import { apiClient } from './client';
import type { Order, OrderPayload } from '../types/order';

export async function getOrders(keyword?: string) {
  const response = await apiClient.get<Order[]>('/orders', {
    params: keyword ? { keyword } : undefined,
  });
  return response.data;
}

export async function getOrderDetail(id: string) {
  const response = await apiClient.get<Order>(`/orders/${id}`);
  return response.data;
}

export async function createOrder(payload: OrderPayload) {
  const response = await apiClient.post<Order>('/orders', payload);
  return response.data;
}
