/**
 * 文件说明：登录页面。
 * 功能说明：提供账号密码登录入口，并在成功后写入前端登录态。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：组件实现
 */
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/auth-store';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      navigate('/dashboard');
    },
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(140deg, #eef7f3 0%, #f8fafc 45%, #f2f6f4 100%)',
      }}
    >
      <Card
        bordered={false}
        style={{
          width: 420,
          borderRadius: 18,
          boxShadow: '0 20px 48px rgba(18, 38, 63, 0.12)',
        }}
      >
        <Typography.Title level={2} style={{ marginBottom: 8 }}>
          一清一护全球严选
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
          OPC 操作系统后台登录
        </Typography.Paragraph>

        {loginMutation.isError ? (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message="登录失败"
            description="请检查账号密码或确认后端服务是否已启动。"
          />
        ) : null}

        <Form
          layout="vertical"
          onFinish={(values) => loginMutation.mutate(values)}
          initialValues={{
            username: 'admin',
            password: 'Admin123456',
          }}
        >
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="请输入账号" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loginMutation.isPending}
          >
            登录系统
          </Button>
        </Form>
      </Card>
    </div>
  );
}
