/**
 * 文件说明：系统设置页面。
 * 功能说明：提供基础配置项管理和操作日志查看，满足个人使用期最关键的后台治理需求。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：页面组件
 */
import { PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { createSystemConfig, getOperationLogs, getSystemConfigs } from '../../api/settings';
import type { OperationLogItem, SystemConfigPayload, SystemConfig } from '../../types/setting';

const configTypeOptions = ['source_channel', 'customer_type', 'product_category', 'content_platform'];

export function SettingsPage() {
  const [activeType, setActiveType] = useState<string>('source_channel');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const configsQuery = useQuery({
    queryKey: ['system-configs', activeType],
    queryFn: () => getSystemConfigs(activeType),
  });

  const logsQuery = useQuery({
    queryKey: ['operation-logs'],
    queryFn: getOperationLogs,
  });

  const createMutation = useMutation({
    mutationFn: createSystemConfig,
    onSuccess: () => {
      message.success('配置项已创建');
      setDrawerOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['system-configs'] });
    },
  });

  const configColumns = useMemo(
    () => [
      { title: '配置类型', dataIndex: 'configType', width: 160 },
      { title: '配置键', dataIndex: 'configKey', width: 160 },
      {
        title: '显示名称',
        render: (_: unknown, record: SystemConfig) => record.configValue?.label || '-',
        width: 180,
      },
      {
        title: '实际值',
        render: (_: unknown, record: SystemConfig) => record.configValue?.value || '-',
        width: 180,
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (value: string) => (
          <Tag color={value === 'ENABLED' ? 'green' : 'default'}>
            {value === 'ENABLED' ? '启用' : '停用'}
          </Tag>
        ),
        width: 100,
      },
      { title: '备注', dataIndex: 'remarks' },
    ],
    [],
  );

  const logColumns = useMemo(
    () => [
      { title: '模块', dataIndex: 'module', width: 120 },
      { title: '业务类型', dataIndex: 'bizType', width: 120 },
      { title: '业务ID', dataIndex: 'bizId', width: 220 },
      { title: '动作', dataIndex: 'action', width: 120 },
      { title: '变更摘要', dataIndex: 'changeSummary' },
      { title: '操作人', dataIndex: 'operatorName', width: 120 },
      {
        title: '时间',
        dataIndex: 'createdAt',
        render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
        width: 170,
      },
    ],
    [],
  );

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card bordered={false} className="page-card">
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <div>
            <Typography.Title level={3} className="page-title">
              系统设置
            </Typography.Title>
            <Typography.Paragraph className="page-desc">
              第一版先支持基础配置项管理和操作日志查看，便于个人日常维护业务口径。
            </Typography.Paragraph>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
            新增配置
          </Button>
        </Space>
      </Card>

      <Card bordered={false}>
        <Tabs
          activeKey={activeType}
          onChange={setActiveType}
          items={configTypeOptions.map((item) => ({
            key: item,
            label: item,
            children: (
              <Table<SystemConfig>
                rowKey="id"
                loading={configsQuery.isLoading}
                columns={configColumns}
                dataSource={configsQuery.data ?? []}
                pagination={{ pageSize: 8 }}
                scroll={{ x: 1100 }}
              />
            ),
          }))}
        />
      </Card>

      <Card bordered={false} title="操作日志">
        <Table<OperationLogItem>
          rowKey="id"
          loading={logsQuery.isLoading}
          columns={logColumns}
          dataSource={logsQuery.data ?? []}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Drawer
        title="新增配置项"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            configType: activeType,
            status: 'ENABLED',
          }}
          onFinish={(values) => createMutation.mutate(values as SystemConfigPayload)}
        >
          <Form.Item label="配置类型" name="configType" rules={[{ required: true }]}>
            <Select
              options={configTypeOptions.map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </Form.Item>
          <Form.Item label="配置键" name="configKey" rules={[{ required: true }]}>
            <Input placeholder="如：taobao、enterprise、video" />
          </Form.Item>
          <Form.Item label="显示名称" name="label" rules={[{ required: true }]}>
            <Input placeholder="如：淘宝、企业客户、视频号" />
          </Form.Item>
          <Form.Item label="实际值" name="value">
            <Input placeholder="可不填，默认使用配置键" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              options={[
                { label: '启用', value: 'ENABLED' },
                { label: '停用', value: 'DISABLED' },
              ]}
            />
          </Form.Item>
          <Form.Item label="备注" name="remarks">
            <Input.TextArea rows={4} placeholder="记录该配置项用途或使用说明" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={createMutation.isPending}>
            保存配置项
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
