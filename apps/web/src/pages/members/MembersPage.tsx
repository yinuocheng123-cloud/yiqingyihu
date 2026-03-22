/**
 * 文件说明：会员管理页面。
 * 功能说明：提供会员列表和从客户转会员的最小操作闭环。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：页面组件
 */
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  DatePicker,
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
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers } from '../../api/customers';
import { createMember, getMembers } from '../../api/members';
import type { MemberPayload, Member } from '../../types/member';

export function MembersPage() {
  const [keyword, setKeyword] = useState('');
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ['members', keyword],
    queryFn: () => getMembers(keyword || undefined),
  });

  const customersQuery = useQuery({
    queryKey: ['member-customer-options'],
    queryFn: () => getCustomers(),
  });

  const createMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      message.success('会员已创建');
      setDrawerOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const columns = useMemo(
    () => [
      {
        title: '会员编号',
        dataIndex: 'memberNo',
        width: 180,
      },
      {
        title: '客户',
        render: (_: unknown, record: Member) => (
          <Link to={`/customers/${record.customer.id}`}>{record.customer.name}</Link>
        ),
        width: 140,
      },
      {
        title: '客户编号',
        dataIndex: ['customer', 'customerNo'],
        width: 160,
      },
      {
        title: '加入时间',
        dataIndex: 'joinedAt',
        render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
        width: 170,
      },
      {
        title: '会员状态',
        dataIndex: 'status',
        render: (value: string) => <Tag color="green">{value}</Tag>,
        width: 120,
      },
      {
        title: '等级',
        dataIndex: 'level',
        width: 120,
      },
      {
        title: '来源',
        dataIndex: 'source',
        width: 140,
      },
      {
        title: '累计购买次数',
        dataIndex: 'purchaseCount',
        width: 120,
      },
      {
        title: '累计消费金额',
        dataIndex: 'totalAmount',
        render: (value: number) => `¥${value}`,
        width: 140,
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
              会员管理
            </Typography.Title>
            <Typography.Paragraph className="page-desc">
              第一版先做轻会员，把首购和高复购客户沉淀为可持续运营的用户资产。
            </Typography.Paragraph>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
            新增会员
          </Button>
        </Space>

        <Space style={{ marginTop: 16 }}>
          <Input
            placeholder="搜索会员编号、客户编号、客户姓名"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={{ width: 320 }}
            onPressEnter={() => setKeyword(searchText.trim())}
          />
          <Button icon={<SearchOutlined />} onClick={() => setKeyword(searchText.trim())}>
            搜索
          </Button>
        </Space>
      </Card>

      <Card bordered={false}>
        <Table<Member>
          rowKey="id"
          loading={membersQuery.isLoading}
          columns={columns}
          dataSource={membersQuery.data ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Drawer
        title="新增会员"
        width={500}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            joinedAt: dayjs(),
            status: '有效',
            level: '轻会员',
            source: '客户转化',
            benefitStatus: '已开通',
          }}
          onFinish={(values) =>
            createMutation.mutate({
              ...values,
              joinedAt: values.joinedAt?.format('YYYY-MM-DDTHH:mm:ss'),
            } as MemberPayload)
          }
        >
          <Form.Item label="关联客户" name="customerId" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="请选择客户"
              options={(customersQuery.data ?? []).map((customer) => ({
                label: `${customer.name} / ${customer.customerNo}`,
                value: customer.id,
              }))}
            />
          </Form.Item>
          <Form.Item label="加入时间" name="joinedAt">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="会员状态" name="status">
            <Select
              options={['有效', '暂停', '失效'].map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </Form.Item>
          <Form.Item label="会员等级" name="level">
            <Input placeholder="默认轻会员" />
          </Form.Item>
          <Form.Item label="会员来源" name="source">
            <Input placeholder="如：客户转化、回访转化" />
          </Form.Item>
          <Form.Item label="权益状态" name="benefitStatus">
            <Input placeholder="如：已开通、待确认" />
          </Form.Item>
          <Form.Item label="备注" name="remarks">
            <Input.TextArea rows={4} placeholder="记录会员关键信息与后续维护重点" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={createMutation.isPending}>
            保存会员
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
