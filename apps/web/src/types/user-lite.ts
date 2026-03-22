/**
 * 文件说明：轻量用户类型定义。
 * 功能说明：提供任务指派场景需要的最小用户结构。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
export interface UserLite {
  id: string;
  username: string;
  realName: string;
  status: 'ENABLED' | 'DISABLED';
}
