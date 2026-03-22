/**
 * 文件说明：任务模块类型定义。
 * 功能说明：统一待办工作台所需的任务结构。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
export interface TaskItem {
  id: string;
  taskNo: string;
  taskType: string;
  title: string;
  description?: string | null;
  status: 'OPEN' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  priority: number;
  sourceType: string;
  sourceId: string;
  payload?: Record<string, unknown> | null;
  dueAt?: string | null;
  responsibleId?: string | null;
  responsible?: {
    id: string;
    realName: string;
  } | null;
  createdAt: string;
}
