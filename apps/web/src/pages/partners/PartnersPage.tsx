/**
 * 文件说明：伙伴管理页面。
 * 功能说明：提供伙伴列表和新增伙伴能力，承接代理/分销意向沉淀。
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
  Checkbox,
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
import { createPartner, getPartners } from '../../api/partners';
import type { Partner, PartnerPayload } from '../../types/partner';

export function PartnersPage() {
  const [keyword, setKeyword] = useState('');
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const partnersQuery = useQuery({
    queryKey: ['partners', keyword],
    queryFn: () => getPartners(keyword || undefined),
  });

  const customersQuery = useQuery({
    queryKey: ['partner-customer-options'],
    queryFn: () => getCustomers(),
  });

  const createMutation = useMutation({
    mutationFn: createPartner,
    onSuccess: () => {
      message.success('伙伴档案已创建');
      setDrawerOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const columns = useMemo(
    () => [
      { title: '伙伴编号', dataIndex: 'partnerNo', width: 180 },
      {
        title: '姓名',
        dataIndex: 'name',
        width: 140,
      },
      {
        title: '关联客户',
        render: (_: unknown, record: Partner) =>
          record.customer ? (
            <Link to={`/customers/${record.customer.id}`}>{record.customer.name}</Link>
          ) : (
            '-'
          ),
        width: 160,
      },
      { title: '手机号', dataIndex: 'mobile', width: 140 },
      { title: '身份类型', dataIndex: 'identityType', width: 120 },
      { title: '来源方式', dataIndex: 'sourceType', width: 120 },
      {
        title: '当前状态',
        dataIndex: 'status',
        render: (value: string) => <Tag color="green">{value}</Tag>,
        width: 120,
      },
      {
        title: '培训状态',
        render: (_: unknown, record: Partner) =>
          record.attendedTraining ? `已培训 ${record.trainingAt ? dayjs(record.trainingAt).format('MM-DD') : ''}` : '未培训',
        width: 160,
      },
      { title: '激活状态', dataIndex: 'activationStatus', width: 120 },
    ],
    [],
  );

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card bordered={false} className="page-card">
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <div>
            <Typography.Title level={3} className="page-title">
              代理/分销管理
            </Typography.Title>
            <Typography.Paragraph className="page-desc">
              第一版先沉淀伙伴档案、培训状态和合作状态，把代理意向从客户中独立出来管理。
            </Typography.Paragraph>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
            新增伙伴
          </Button>
        </Space>

        <Space style={{ marginTop: 16 }}>
          <Input
            placeholder="搜索伙伴编号、姓名、手机号"
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
        <Table<Partner>
          rowKey="id"
          loading={partnersQuery.isLoading}
          columns={columns}
          dataSource={partnersQuery.data ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Drawer
        title="新增伙伴"
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            identityType: '分销',
            sourceType: '客户转化',
            status: '意向中',
            activationStatus: '未激活',
            attendedTraining: false,
          }}
          onFinish={(values) =>
            createMutation.mutate({
              ...values,
              trainingAt: values.trainingAt?.format('YYYY-MM-DDTHH:mm:ss'),
            } as PartnerPayload)
          }
        >
          <Form.Item label="关联客户" name="customerId">
            <Select
              showSearch
              allowClear
              optionFilterProp="label"
              placeholder="可选：从客户转化"
              options={(customersQuery.data ?? []).map((customer) => ({
                label: `${customer.name} / ${customer.customerNo}`,
                value: customer.id,
              }))}
            />
          </Form.Item>
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入伙伴姓名" />
          </Form.Item>
          <Form.Item label="手机号" name="mobile">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="微信号" name="wechatId">
            <Input placeholder="请输入微信号" />
          </Form.Item>
          <Form.Item label="区域" name="region">
            <Input placeholder="请输入所在区域" />
          </Form.Item>
          <Form.Item label="身份类型" name="identityType" rules={[{ required: true }]}>
            <Select
              options={['代理', '分销', '合伙人'].map((item) => ({ label: item, value: item }))}
            />
          </Form.Item>
          <Form.Item label="来源方式" name="sourceType" rules={[{ required: true }]}>
            <Input placeholder="如：客户转化、主动咨询、老客介绍" />
          </Form.Item>
          <Form.Item label="当前状态" name="status">
            <Select
              options={['意向中', '沟通中', '培训中', '已激活', '暂停合作'].map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </Form.Item>
          <Form.Item label="成交记录" name="dealSummary">
            <Input.TextArea rows={3} placeholder="记录过往成交或资源情况" />
          </Form.Item>
          <Form.Item label="培训时间" name="trainingAt">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="激活状态" name="activationStatus">
            <Input placeholder="如：未激活、已激活" />
          </Form.Item>
          <Form.Item name="attendedTraining" valuePropName="checked">
            <Checkbox>已参加培训</Checkbox>
          </Form.Item>
          <Form.Item label="备注" name="remarks">
            <Input.TextArea rows={4} placeholder="记录伙伴资源、合作计划和注意事项" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={createMutation.isPending}>
            保存伙伴档案
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
