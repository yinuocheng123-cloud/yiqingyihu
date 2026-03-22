/**
 * 文件说明：后台主布局。
 * 功能说明：提供统一导航、菜单和内容区域，作为各业务页面的外壳。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：菜单配置
 *   第三部分：布局组件
 */
import {
  BarChartOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, Space, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <HomeOutlined />, label: '经营看板' },
  { key: '/tasks', icon: <UnorderedListOutlined />, label: '待办中心' },
  { key: '/customers', icon: <UserOutlined />, label: '客户管理' },
  { key: '/orders', icon: <ShoppingOutlined />, label: '订单管理' },
  { key: '/products', icon: <ShoppingOutlined />, label: '产品管理' },
  { key: '/followups', icon: <FileTextOutlined />, label: '回访复购' },
  { key: '/members', icon: <TeamOutlined />, label: '会员管理' },
  { key: '/partners', icon: <TeamOutlined />, label: '代理伙伴' },
  { key: '/content-assets', icon: <FileTextOutlined />, label: '内容素材' },
  { key: '/settings', icon: <BarChartOutlined />, label: '系统设置' },
];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={232}>
        <div
          style={{
            padding: 20,
            fontWeight: 700,
            color: '#1f7a59',
            lineHeight: 1.5,
          }}
        >
          一清一护全球严选
          <div style={{ fontSize: 12, color: '#98a2b3', fontWeight: 500 }}>
            OPC 操作系统
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[
            location.pathname.startsWith('/settings')
              ? '/settings'
              : location.pathname,
          ]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #eef2f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 24px',
          }}
        >
          <div>
            <Typography.Title level={5} style={{ margin: 0 }}>
              轻量业务中台 MVP
            </Typography.Title>
            <Typography.Text type="secondary">
              先把客户、订单、回访与复购跑顺
            </Typography.Text>
          </div>
          <Space>
            <Typography.Text>{user?.realName ?? '未登录'}</Typography.Text>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => {
                clearAuth();
                navigate('/login');
              }}
            >
              退出
            </Button>
          </Space>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
