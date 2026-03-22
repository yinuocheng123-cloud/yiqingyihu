/**
 * 文件说明：认证类型定义。
 * 功能说明：统一前端登录态、用户信息和登录响应类型。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
export interface CurrentUser {
  id: string;
  username: string;
  realName: string;
  roleCodes: string[];
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  user: CurrentUser;
}
