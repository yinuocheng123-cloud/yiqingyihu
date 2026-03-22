/**
 * 文件说明：看板接口封装。
 * 功能说明：提供首页概览和待办提醒请求。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import { apiClient } from './client';
import type { DashboardOverview, DashboardReminders } from '../types/dashboard';

export async function getDashboardOverview() {
  const response = await apiClient.get<DashboardOverview>('/dashboard/overview');
  return response.data;
}

export async function getDashboardReminders() {
  const response = await apiClient.get<DashboardReminders>('/dashboard/reminders');
  return response.data;
}
