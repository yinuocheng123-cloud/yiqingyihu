/**
 * 文件说明：回访复购页面。
 * 功能说明：提供回访列表和三次回访录入能力，支撑复购、会员和代理机会判断。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：基础常量
 *   第三部分：页面组件
 */
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
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
import { createFollowup, getFollowups, updateFollowup } from '../../api/followups';
import { getOrders } from '../../api/orders';
import type { Followup, FollowupPayload } from '../../types/followup';

const followupResults = [
  '未联系上',
  '已联系',
  '反馈良好',
  '有使用问题',
  '有售后问题',
  '有复购意向',
  '可邀请会员',
  '可跟进代理',
];

export function FollowupsPage() {
  const [keyword, setKeyword] = useState('');
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Followup | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const followupsQuery = useQuery({
    queryKey: ['followups', keyword],
    queryFn: () => getFollowups(keyword || undefined),
  });

  const ordersQuery = useQuery({
    queryKey: ['order-options'],
    queryFn: () => getOrders(),
  });

  const createMutation = useMutation({
    mutationFn: createFollowup,
    onSuccess: () => {
      message.success('回访记录已创建');
      handleClose();
      refreshQueries();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FollowupPayload }) =>
      updateFollowup(id, payload),
    onSuccess: () => {
      message.success('回访记录已更新');
      handleClose();
      refreshQueries();
    },
  });

  const columns = useMemo(
    () => [
      {
        title: '回访编号',
        dataIndex: 'followupNo',
        width: 180,
      },
      {
        title: '订单编号',
        render: (_: unknown, record: Followup) => (
          <Link to={`/orders/${record.order.id}`}>{record.order.orderNo}</Link>
        ),
        width: 180,
      },
      {
        title: '客户',
        render: (_: unknown, record: Followup) => (
          <Link to={`/customers/${record.customer.id}`}>{record.customer.name}</Link>
        ),
        width: 140,
      },
      {
        title: '第一次回访',
        dataIndex: 'firstResult',
        render: (value: string | null) => value || '-',
        width: 140,
      },
      {
        title: '第二次回访',
        dataIndex: 'secondResult',
        render: (value: string | null) => value || '-',
        width: 140,
      },
      {
        title: '第三次回访',
        dataIndex: 'thirdResult',
        render: (value: string | null) => value || '-',
        width: 140,
      },
      {
        title: '满意度',
        dataIndex: 'satisfactionScore',
        width: 100,
        render: (value: number | null) => value ?? '-',
      },
      {
        title: '可复购',
        dataIndex: 'isRepurchaseFit',
        width: 100,
        render: (value: boolean) => (value ? <Tag color="green">是</Tag> : '否'),
      },
      {
        title: '预计复购时间',
        dataIndex: 'expectedRepurchaseAt',
        render: (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
        width: 140,
      },
      {
        title: '操作',
        key: 'action',
        fixed: 'right' as const,
        width: 90,
        render: (_: unknown, record: Followup) => (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
        ),
      },
    ],
    [],
  );

  function refreshQueries() {
    queryClient.invalidateQueries({ queryKey: ['followups'] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  }

  function handleClose() {
    setDrawerOpen(false);
    setEditing(null);
    form.resetFields();
  }

  function handleEdit(record: Followup) {
    setEditing(record);
    setDrawerOpen(true);
    form.setFieldsValue({
      orderId: record.orderId,
      firstFollowupAt: record.firstFollowupAt ? dayjs(record.firstFollowupAt) : undefined,
      firstResult: record.firstResult,
      secondFollowupAt: record.secondFollowupAt ? dayjs(record.secondFollowupAt) : undefined,
      secondResult: record.secondResult,
      thirdFollowupAt: record.thirdFollowupAt ? dayjs(record.thirdFollowupAt) : undefined,
      thirdResult: record.thirdResult,
      satisfactionScore: record.satisfactionScore,
      expectedRepurchaseAt: record.expectedRepurchaseAt
        ? dayjs(record.expectedRepurchaseAt)
        : undefined,
      isRepurchaseFit: record.isRepurchaseFit,
      hasRepurchase: record.hasRepurchase,
      convertedToMember: record.convertedToMember,
      hasPartnerIntent: record.hasPartnerIntent,
      remarks: record.remarks,
    });
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card bordered={false} className="page-card">
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <div>
            <Typography.Title level={3} className="page-title">
              回访复购
            </Typography.Title>
            <Typography.Paragraph className="page-desc">
              先把三次回访、满意度、预计复购和会员/代理机会标记做起来，让成交后的跟进能持续发生。
            </Typography.Paragraph>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setDrawerOpen(true);
            }}
          >
            新建回访
          </Button>
        </Space>

        <Space style={{ marginTop: 16 }}>
          <Input
            placeholder="搜索回访编号、订单编号、客户编号、客户姓名"
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
        <Table<Followup>
          rowKey="id"
          loading={followupsQuery.isLoading}
          columns={columns}
          dataSource={followupsQuery.data ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1450 }}
        />
      </Card>

      <Drawer
        title={editing ? '编辑回访' : '新建回访'}
        width={560}
        open={drawerOpen}
        onClose={handleClose}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            isRepurchaseFit: false,
            hasRepurchase: false,
            convertedToMember: false,
            hasPartnerIntent: false,
          }}
          onFinish={(values) => {
            const payload: FollowupPayload = {
              orderId: values.orderId,
              firstFollowupAt: values.firstFollowupAt
                ? values.firstFollowupAt.format('YYYY-MM-DDTHH:mm:ss')
                : undefined,
              firstResult: values.firstResult,
              secondFollowupAt: values.secondFollowupAt
                ? values.secondFollowupAt.format('YYYY-MM-DDTHH:mm:ss')
                : undefined,
              secondResult: values.secondResult,
              thirdFollowupAt: values.thirdFollowupAt
                ? values.thirdFollowupAt.format('YYYY-MM-DDTHH:mm:ss')
                : undefined,
              thirdResult: values.thirdResult,
              satisfactionScore: values.satisfactionScore,
              expectedRepurchaseAt: values.expectedRepurchaseAt
                ? values.expectedRepurchaseAt.format('YYYY-MM-DDTHH:mm:ss')
                : undefined,
              isRepurchaseFit: values.isRepurchaseFit,
              hasRepurchase: values.hasRepurchase,
              convertedToMember: values.convertedToMember,
              hasPartnerIntent: values.hasPartnerIntent,
              remarks: values.remarks,
            };

            if (editing) {
              updateMutation.mutate({ id: editing.id, payload });
              return;
            }

            createMutation.mutate(payload);
          }}
        >
          <Form.Item label="关联订单" name="orderId" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="请选择订单"
              loading={ordersQuery.isLoading}
              options={(ordersQuery.data ?? []).map((order) => ({
                label: `${order.orderNo} / ${order.customer.name}`,
                value: order.id,
              }))}
              disabled={Boolean(editing)}
            />
          </Form.Item>
          <Form.Item label="第一次回访时间" name="firstFollowupAt">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="第一次回访结果" name="firstResult">
            <Select
              allowClear
              options={followupResults.map((item) => ({ label: item, value: item }))}
            />
          </Form.Item>
          <Form.Item label="第二次回访时间" name="secondFollowupAt">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="第二次回访结果" name="secondResult">
            <Select
              allowClear
              options={followupResults.map((item) => ({ label: item, value: item }))}
            />
          </Form.Item>
          <Form.Item label="第三次回访时间" name="thirdFollowupAt">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="第三次回访结果" name="thirdResult">
            <Select
              allowClear
              options={followupResults.map((item) => ({ label: item, value: item }))}
            />
          </Form.Item>
          <Form.Item label="客户满意度" name="satisfactionScore">
            <InputNumber min={1} max={5} style={{ width: '100%' }} placeholder="1-5 分" />
          </Form.Item>
          <Form.Item label="预计复购时间" name="expectedRepurchaseAt">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="备注" name="remarks">
            <Input.TextArea rows={4} placeholder="记录使用反馈、复购判断和后续建议" />
          </Form.Item>
          <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
            <Form.Item name="isRepurchaseFit" valuePropName="checked" noStyle>
              <Checkbox>标记为可复购</Checkbox>
            </Form.Item>
            <Form.Item name="hasRepurchase" valuePropName="checked" noStyle>
              <Checkbox>标记为已复购</Checkbox>
            </Form.Item>
            <Form.Item name="convertedToMember" valuePropName="checked" noStyle>
              <Checkbox>标记为可转会员/已转会员</Checkbox>
            </Form.Item>
            <Form.Item name="hasPartnerIntent" valuePropName="checked" noStyle>
              <Checkbox>标记为有代理意向</Checkbox>
            </Form.Item>
          </Space>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={createMutation.isPending || updateMutation.isPending}
          >
            保存回访记录
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
