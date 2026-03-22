/**
 * 文件说明：接口客户端封装。
 * 功能说明：集中处理 baseURL、token 注入和未授权场景。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：实例与拦截器
 */
import axios from 'axios';
import { useAuthStore } from '../store/auth-store';

export const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  },
);
