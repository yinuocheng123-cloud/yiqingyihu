/**
 * 文件说明：认证接口。
 * 功能说明：封装登录请求，避免页面直接耦合接口细节。
 *
 * 结构概览：
 *   第一部分：接口定义
 */
import { apiClient } from './client';
import type { LoginResponse } from '../types/auth';

export interface LoginPayload {
  username: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<LoginResponse>('/auth/login', payload);
  return response.data;
}
