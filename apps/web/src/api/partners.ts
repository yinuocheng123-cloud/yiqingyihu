/**
 * 文件说明：伙伴模块接口封装。
 * 功能说明：集中管理伙伴列表和新增接口。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import { apiClient } from './client';
import type { Partner, PartnerPayload } from '../types/partner';

export async function getPartners(keyword?: string) {
  const response = await apiClient.get<Partner[]>('/partners', {
    params: keyword ? { keyword } : undefined,
  });
  return response.data;
}

export async function createPartner(payload: PartnerPayload) {
  const response = await apiClient.post<Partner>('/partners', payload);
  return response.data;
}
