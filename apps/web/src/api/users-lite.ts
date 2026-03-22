/**
 * 文件说明：轻量用户接口封装。
 * 功能说明：提供任务指派场景需要的用户列表查询。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import type { UserLite } from '../types/user-lite';
import { apiClient } from './client';

export async function getUserOptions() {
  const response = await apiClient.get<UserLite[]>('/users');
  return response.data;
}
