/**
 * 文件说明：回访模块接口封装。
 * 功能说明：集中管理回访列表、详情、新增和编辑接口。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import { apiClient } from './client';
import type { Followup, FollowupPayload } from '../types/followup';

export async function getFollowups(keyword?: string) {
  const response = await apiClient.get<Followup[]>('/followups', {
    params: keyword ? { keyword } : undefined,
  });
  return response.data;
}

export async function createFollowup(payload: FollowupPayload) {
  const response = await apiClient.post<Followup>('/followups', payload);
  return response.data;
}

export async function updateFollowup(id: string, payload: FollowupPayload) {
  const response = await apiClient.patch<Followup>(`/followups/${id}`, payload);
  return response.data;
}
