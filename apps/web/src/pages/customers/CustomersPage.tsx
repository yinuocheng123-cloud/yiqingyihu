/**
 * 文件说明：客户管理页面。
 * 功能说明：提供客户列表查询和最小建档能力，作为第一版业务主入口。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：基础常量
 *   第三部分：页面组件
 */
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
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
  Tag,
  Typography,
  message,
} from 'antd';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createCustomer, getCustomers } from '../../api/customers';
import type { Customer, CustomerPayload } from '../../types/customer';

const sourceOptions = ['淘宝', '小程序', '小红书', '老客户介绍', '微信私聊', '企业微信'];
const customerTypeOptions = ['个人客户', '家庭客户', '企业客户', '潜在代理'];
const lifecycleOptions = ['新线索', '已建档', '已首购', '回访中', '可复购'];

export function CustomersPage() {
  const [keyword, setKeyword] = useState('');
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm<CustomerPayload>();
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ['customers', keyword],
    queryFn: () => getCustomers(keyword || undefined),
  });

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      message.success('客户已建档');
      setDrawerOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const columns = useMemo(
    () => [
      {
        title: '客户编号',
        dataIndex: 'customerNo',
        key: 'customerNo',
        width: 180,
      },
      {
        title: '姓名/昵称',
        dataIndex: 'name',
        key: 'name',
        width: 140,
        render: (value: string, record: Customer) => (
          <Link to={`/customers/${record.id}`}>{value}</Link>
        ),
      },
      {
        title: '手机号',
        dataIndex: 'mobile',
        key: 'mobile',
        width: 140,
      },
      {
        title: '来源渠道',
        dataIndex: 'sourceChannel',
        key: 'sourceChannel',
        width: 120,
      },
      {
        title: '客户类型',
        dataIndex: 'customerType',
        key: 'customerType',
        width: 120,
      },
      {
        title: '生命周期',
        dataIndex: 'lifecycleStage',
        key: 'lifecycleStage',
        width: 120,
        render: (value: string) => <Tag color="green">{value}</Tag>,
      },
      {
        title: '跟进状态',
        dataIndex: 'followupStatus',
        key: 'followupStatus',
        width: 120,
        render: (value: string) => <Tag color="blue">{value}</Tag>,
      },
      {
        title: '代理意向',
        dataIndex: 'hasPartnerIntent',
        key: 'hasPartnerIntent',
        width: 100,
        render: (value: boolean) => (value ? '是' : '否'),
      },
      {
        title: '备注',
        dataIndex: 'remarks',
        key: 'remarks',
      },
    ],
    [],
  );

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card bordered={false} className="page-card">
        <Space
          style={{ width: '100%', justifyContent: 'space-between' }}
          align="start"
        >
          <div>
            <Typography.Title level={3} className="page-title">
              客户管理
            </Typography.Title>
            <Typography.Paragraph className="page-desc">
              第一版先解决“客户跟不住”，从客户建档、来源记录和跟进状态开始。
            </Typography.Paragraph>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setDrawerOpen(true)}
          >
            新增客户
          </Button>
        </Space>

        <Space style={{ marginTop: 16 }}>
          <Input
            placeholder="搜索客户编号、姓名、手机号、微信号"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={{ width: 320 }}
            onPressEnter={() => setKeyword(searchText.trim())}
          />
          <Button
            icon={<SearchOutlined />}
            onClick={() => setKeyword(searchText.trim())}
          >
            搜索
          </Button>
        </Space>
      </Card>

      <Card bordered={false}>
        <Table<Customer>
          rowKey="id"
          loading={customersQuery.isLoading}
          columns={columns}
          dataSource={customersQuery.data ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Drawer
        title="新增客户"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={(values) => createMutation.mutate(values)}
          initialValues={{
            sourceChannel: '微信私聊',
            customerType: '个人客户',
            lifecycleStage: '新线索',
            followupStatus: '待跟进',
            hasPartnerIntent: false,
            isEnterprise: false,
          }}
        >
          <Form.Item label="姓名/昵称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入客户姓名或昵称" />
          </Form.Item>
          <Form.Item label="手机号" name="mobile">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="微信号" name="wechatId">
            <Input placeholder="请输入微信号" />
          </Form.Item>
          <Form.Item label="来源渠道" name="sourceChannel" rules={[{ required: true }]}>
            <Select options={sourceOptions.map((item) => ({ label: item, value: item }))} />
          </Form.Item>
          <Form.Item label="客户类型" name="customerType" rules={[{ required: true }]}>
            <Select
              options={customerTypeOptions.map((item) => ({ label: item, value: item }))}
            />
          </Form.Item>
          <Form.Item label="生命周期" name="lifecycleStage">
            <Select
              options={lifecycleOptions.map((item) => ({ label: item, value: item }))}
            />
          </Form.Item>
          <Form.Item label="跟进状态" name="followupStatus">
            <Input placeholder="如：待跟进、跟进中、已成交" />
          </Form.Item>
          <Form.Item label="备注" name="remarks">
            <Input.TextArea rows={4} placeholder="记录客户兴趣、场景或跟进重点" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={createMutation.isPending}
          >
            保存客户
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
