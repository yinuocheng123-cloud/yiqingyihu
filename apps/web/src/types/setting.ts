/**
 * 文件说明：系统设置类型定义。
 * 功能说明：统一配置项与日志数据结构。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
export interface SystemConfig {
  id: string;
  configType: string;
  configKey: string;
  configValue: {
    label?: string;
    value?: string;
  };
  status: 'ENABLED' | 'DISABLED';
  remarks?: string | null;
}

export interface SystemConfigPayload {
  configType: string;
  configKey: string;
  label: string;
  value?: string;
  status?: 'ENABLED' | 'DISABLED';
  remarks?: string;
}

export interface OperationLogItem {
  id: string;
  module: string;
  bizType: string;
  bizId: string;
  action: string;
  changeSummary?: string | null;
  operatorName?: string | null;
  createdAt: string;
}
