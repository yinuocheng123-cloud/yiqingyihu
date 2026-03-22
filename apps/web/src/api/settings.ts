/**
 * 文件说明：系统设置接口封装。
 * 功能说明：集中管理配置项和日志查看接口。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import { apiClient } from './client';
import type {
  OperationLogItem,
  SystemConfig,
  SystemConfigPayload,
} from '../types/setting';

export async function getSystemConfigs(configType?: string) {
  const response = await apiClient.get<SystemConfig[]>('/settings/configs', {
    params: configType ? { configType } : undefined,
  });
  return response.data;
}

export async function createSystemConfig(payload: SystemConfigPayload) {
  const response = await apiClient.post<SystemConfig>('/settings/configs', payload);
  return response.data;
}

export async function getOperationLogs() {
  const response = await apiClient.get<OperationLogItem[]>('/settings/logs');
  return response.data;
}
