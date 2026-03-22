/**
 * 文件说明：任务模块接口封装。
 * 功能说明：提供待办列表和任务状态更新接口。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import type { TaskItem } from '../types/task';
import { apiClient } from './client';

export async function getInboxTasks(params?: {
  status?: string;
  taskType?: string;
  responsibleId?: string;
  priority?: number;
  keyword?: string;
}) {
  const response = await apiClient.get<TaskItem[]>('/tasks/inbox', { params });
  return response.data;
}

export async function updateTaskStatus(input: {
  id: string;
  payload: { status: 'IN_REVIEW' | 'DONE' | 'CANCELLED'; note?: string };
}) {
  const response = await apiClient.patch<TaskItem>(`/tasks/${input.id}/status`, input.payload);
  return response.data;
}

export async function updateTask(input: {
  id: string;
  payload: { responsibleId?: string; dueAt?: string; priority?: number; note?: string };
}) {
  const response = await apiClient.patch<TaskItem>(`/tasks/${input.id}`, input.payload);
  return response.data;
}

export async function bulkUpdateTaskStatus(input: {
  ids: string[];
  status: 'IN_REVIEW' | 'DONE' | 'CANCELLED';
}) {
  const response = await apiClient.patch<TaskItem[]>('/tasks/bulk/status', input);
  return response.data;
}
