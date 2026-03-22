/**
 * 文件说明：Google OAuth 登录回调页。
 * 功能说明：接收后端回跳附带的 JWT 和用户信息，并写入前端登录态后跳转到工作台。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：页面组件
 */
import { Card, Spin, Typography } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';
import type { CurrentUser } from '../../types/auth';

export function GoogleAuthCallbackPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hash.get('accessToken');
    const rawUser = hash.get('user');

    if (!accessToken || !rawUser) {
      navigate('/login?googleError=1', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(rawUser)) as CurrentUser;
      setAuth(decodeURIComponent(accessToken), user);
      navigate('/dashboard', { replace: true });
    } catch {
      navigate('/login?googleError=1', { replace: true });
    }
  }, [navigate, setAuth]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(140deg, #eef7f3 0%, #f8fafc 45%, #f2f6f4 100%)',
      }}
    >
      <Card bordered={false} style={{ width: 420, borderRadius: 18, textAlign: 'center' }}>
        <Spin size="large" />
        <Typography.Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
          正在完成 Google 登录
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          请稍候，系统正在写入登录态并跳转到工作台。
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
