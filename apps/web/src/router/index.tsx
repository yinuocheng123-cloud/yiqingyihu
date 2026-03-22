/**
 * 文件说明：前端路由配置。
 * 功能说明：定义登录页、受保护后台页面和基础路由守卫。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：守卫组件
 *   第三部分：路由组件
 */
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { GoogleAuthCallbackPage } from '../pages/auth/GoogleAuthCallbackPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { CustomersPage } from '../pages/customers/CustomersPage';
import { CustomerDetailPage } from '../pages/customers/CustomerDetailPage';
import { OrdersPage } from '../pages/orders/OrdersPage';
import { OrderDetailPage } from '../pages/orders/OrderDetailPage';
import { ProductsPage } from '../pages/products/ProductsPage';
import { FollowupsPage } from '../pages/followups/FollowupsPage';
import { MembersPage } from '../pages/members/MembersPage';
import { PartnersPage } from '../pages/partners/PartnersPage';
import { ContentAssetsPage } from '../pages/content-assets/ContentAssetsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { TasksPage } from '../pages/tasks/TasksPage';
import { useAuthStore } from '../store/auth-store';

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  return token ? <AppLayout /> : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/google/callback',
    element: <GoogleAuthCallbackPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/:id', element: <CustomerDetailPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'followups', element: <FollowupsPage /> },
      { path: 'members', element: <MembersPage /> },
      { path: 'partners', element: <PartnersPage /> },
      { path: 'content-assets', element: <ContentAssetsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
