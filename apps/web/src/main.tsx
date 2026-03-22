/**
 * 文件说明：前端应用入口。
 * 功能说明：挂载全局样式、路由和 React Query。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：应用挂载
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { AppRouter } from './router';
import './styles.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1f7a59',
          borderRadius: 8,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
