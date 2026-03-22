/**
 * 文件说明：会员模块接口封装。
 * 功能说明：集中管理会员查询和新增接口。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import { apiClient } from './client';
import type { Member, MemberPayload } from '../types/member';

export async function getMembers(keyword?: string) {
  const response = await apiClient.get<Member[]>('/members', {
    params: keyword ? { keyword } : undefined,
  });
  return response.data;
}

export async function createMember(payload: MemberPayload) {
  const response = await apiClient.post<Member>('/members', payload);
  return response.data;
}
