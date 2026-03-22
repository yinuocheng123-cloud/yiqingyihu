/**
 * 文件说明：Vite 配置文件。
 * 功能说明：定义前端开发服务配置和接口代理，方便前后端联调。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：配置导出
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
