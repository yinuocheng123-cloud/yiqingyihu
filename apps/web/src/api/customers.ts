/**
 * 文件说明：客户模块接口封装。
 * 功能说明：集中管理客户查询和新增接口，便于页面专注于展示和交互。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import { apiClient } from './client';
import type { Customer, CustomerDetail, CustomerPayload } from '../types/customer';

export async function getCustomers(keyword?: string) {
  const response = await apiClient.get<Customer[]>('/customers', {
    params: keyword ? { keyword } : undefined,
  });
  return response.data;
}

export async function createCustomer(payload: CustomerPayload) {
  const response = await apiClient.post<Customer>('/customers', payload);
  return response.data;
}

export async function getCustomerDetail(id: string) {
  const response = await apiClient.get<CustomerDetail>(`/customers/${id}`);
  return response.data;
}
