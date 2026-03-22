/**
 * 文件说明：登录态状态管理。
 * 功能说明：负责持久化 token 与当前用户信息，供路由守卫和布局使用。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：状态定义
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurrentUser } from '../types/auth';

interface AuthState {
  token: string | null;
  user: CurrentUser | null;
  setAuth: (token: string, user: CurrentUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'yiqingyihu-auth',
    },
  ),
);
