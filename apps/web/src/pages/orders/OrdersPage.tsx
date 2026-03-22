/**
 * 文件说明：订单管理页面。
 * 功能说明：提供订单列表、录单能力和批量发货入口，把高频履约动作压缩到更少点击里。
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
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState, type Key } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers } from '../../api/customers';
import { createOrder, getOrders } from '../../api/orders';
import { createShipment } from '../../api/shipments';
import type { Order, OrderPayload } from '../../types/order';

const orderChannels = ['淘宝', '小程序', '私域成交', '代理成交'];
const paymentStatuses = ['待收款', '已收款', '部分收款'];
const shipmentModes = ['自营发货', '供应商代发'];

export function OrdersPage() {
  const [keyword, setKeyword] = useState('');
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [batchShipmentOpen, setBatchShipmentOpen] = useState(false);
  const [trackingPasteText, setTrackingPasteText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [form] = Form.useForm();
  const [batchShipmentForm] = Form.useForm();
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders', keyword],
    queryFn: () => getOrders(keyword || undefined),
  });

  const customersQuery = useQuery({
    queryKey: ['customer-options'],
    queryFn: () => getCustomers(),
  });

  const createMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      message.success('订单已录入');
      setDrawerOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-options'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const batchShipmentMutation = useMutation({
    mutationFn: async (values: {
      logisticsCompany?: string;
      shipmentMode?: string;
      shippedAt: string;
      remarks?: string;
      trackingNos?: Array<{ orderId: string; trackingNo?: string }>;
    }) => {
      for (const orderId of selectedRowKeys as string[]) {
        const currentTracking = values.trackingNos?.find((item) => item.orderId === orderId);
        await createShipment({
          orderId,
          logisticsCompany: values.logisticsCompany,
          trackingNo: currentTracking?.trackingNo,
          shipmentMode: values.shipmentMode,
          shippedAt: values.shippedAt,
          remarks: values.remarks,
          shipmentStatus: '已发货',
        });
      }
    },
    onSuccess: () => {
      message.success('批量发货已完成');
      setBatchShipmentOpen(false);
      setSelectedRowKeys([]);
      batchShipmentForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const columns = useMemo(
    () => [
      {
        title: '订单编号',
        dataIndex: 'orderNo',
        render: (value: string, record: Order) => <Link to={`/orders/${record.id}`}>{value}</Link>,
        width: 180,
      },
      {
        title: '客户',
        dataIndex: ['customer', 'name'],
        render: (_: unknown, record: Order) => (
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
        title: '下单时间',
        dataIndex: 'orderDate',
        render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
        width: 170,
      },
      {
        title: '渠道',
        dataIndex: 'orderChannel',
        width: 120,
      },
      {
        title: '金额',
        dataIndex: 'totalAmount',
        render: (value: number) => `¥${value}`,
        width: 100,
      },
      {
        title: '收款状态',
        dataIndex: 'paymentStatus',
        render: (value: string) => <Tag color="green">{value}</Tag>,
        width: 120,
      },
      {
        title: '发货状态',
        dataIndex: 'shipmentStatus',
        render: (value: string) => <Tag color="blue">{value}</Tag>,
        width: 120,
      },
      {
        title: '签收状态',
        dataIndex: 'signStatus',
        render: (value: string) => <Tag color="purple">{value}</Tag>,
        width: 120,
      },
    ],
    [],
  );

  const selectedOrders = useMemo(
    () =>
      (ordersQuery.data ?? []).filter((order) =>
        selectedRowKeys.includes(order.id),
      ),
    [ordersQuery.data, selectedRowKeys],
  );

  function applyTrackingPaste() {
    const lines = trackingPasteText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      message.warning('请先粘贴物流单号内容');
      return;
    }

    const current = (batchShipmentForm.getFieldValue('trackingNos') ?? []) as Array<{
      orderId: string;
      trackingNo?: string;
    }>;

    const mapped = current.map((item, index) => {
      const line = lines[index] ?? '';
      const parts = line.split(/[\s,，]+/).filter(Boolean);

      if (parts.length >= 2) {
        return {
          ...item,
          trackingNo: parts[parts.length - 1],
        };
      }

      return {
        ...item,
        trackingNo: parts[0] ?? '',
      };
    });

    batchShipmentForm.setFieldsValue({
      trackingNos: mapped,
    });
    message.success('已根据粘贴内容填充物流单号');
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card bordered={false} className="page-card">
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <div>
            <Typography.Title level={3} className="page-title">
              订单管理
            </Typography.Title>
            <Typography.Paragraph className="page-desc">
              第一版先把首次成交录入、订单状态追踪和批量发货这条履约链路跑顺。
            </Typography.Paragraph>
          </div>
          <Space>
            <Button
              disabled={!selectedRowKeys.length}
              onClick={() => setBatchShipmentOpen(true)}
            >
              批量发货
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
              新增订单
            </Button>
          </Space>
        </Space>

        <Space style={{ marginTop: 16 }}>
          <Input
            placeholder="搜索订单编号、客户编号、客户姓名、成交渠道"
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
        <Table<Order>
          rowKey="id"
          loading={ordersQuery.isLoading}
          columns={columns}
          dataSource={ordersQuery.data ?? []}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              disabled: record.shipmentStatus === '已发货' || record.signStatus === '已签收',
            }),
          }}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Drawer
        title="新增订单"
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={(values) =>
            createMutation.mutate({
              ...values,
              orderDate: values.orderDate.format('YYYY-MM-DDTHH:mm:ss'),
            } as OrderPayload)
          }
          initialValues={{
            orderChannel: '私域成交',
            paymentStatus: '已收款',
            shipmentMode: '自营发货',
            shipmentStatus: '待发货',
            signStatus: '待签收',
            aftersaleStatus: '无售后',
            orderDate: dayjs(),
          }}
        >
          <Form.Item label="关联客户" name="customerId" rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="请选择客户"
              loading={customersQuery.isLoading}
              options={(customersQuery.data ?? []).map((customer) => ({
                label: `${customer.name} / ${customer.customerNo}`,
                value: customer.id,
              }))}
            />
          </Form.Item>
          <Form.Item label="下单时间" name="orderDate" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="成交渠道" name="orderChannel" rules={[{ required: true }]}>
            <Select options={orderChannels.map((item) => ({ label: item, value: item }))} />
          </Form.Item>
          <Form.Item label="订单金额" name="totalAmount" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入金额" />
          </Form.Item>
          <Form.Item label="收款状态" name="paymentStatus" rules={[{ required: true }]}>
            <Select options={paymentStatuses.map((item) => ({ label: item, value: item }))} />
          </Form.Item>
          <Form.Item label="收款方式" name="paymentMethod">
            <Input placeholder="如：微信、支付宝、淘宝支付" />
          </Form.Item>
          <Form.Item label="发货模式" name="shipmentMode">
            <Select options={shipmentModes.map((item) => ({ label: item, value: item }))} />
          </Form.Item>
          <Form.Item label="备注" name="remarks">
            <Input.TextArea rows={4} placeholder="记录商品说明、成交背景或履约备注" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={createMutation.isPending}>
            保存订单
          </Button>
        </Form>
      </Drawer>

      <Modal
        title="批量发货"
        open={batchShipmentOpen}
        onCancel={() => {
          setBatchShipmentOpen(false);
          setTrackingPasteText('');
          batchShipmentForm.resetFields();
        }}
        onOk={() => batchShipmentForm.submit()}
        confirmLoading={batchShipmentMutation.isPending}
        destroyOnClose
      >
        <Typography.Paragraph type="secondary">
          已选择 {selectedRowKeys.length} 笔订单。这里用于快速完成同一批次发货。
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 12 }}>
          支持按行粘贴物流单号。可直接粘贴“订单号 空格 物流单号”或仅粘贴物流单号，系统会按当前顺序自动匹配。
        </Typography.Paragraph>
        <Input.TextArea
          rows={4}
          value={trackingPasteText}
          onChange={(event) => setTrackingPasteText(event.target.value)}
          placeholder={'示例：\nO2026001 SF123456\nO2026002 SF123457\n或仅粘贴单号，每行一个'}
          style={{ marginBottom: 12 }}
        />
        <Button style={{ marginBottom: 16 }} onClick={applyTrackingPaste}>
          解析粘贴内容
        </Button>
        <Form
          form={batchShipmentForm}
          layout="vertical"
          onFinish={(values) =>
            batchShipmentMutation.mutate({
              logisticsCompany: values.logisticsCompany,
              shipmentMode: values.shipmentMode,
              shippedAt: values.shippedAt.format('YYYY-MM-DDTHH:mm:ss'),
              remarks: values.remarks,
            })
          }
          initialValues={{
            shipmentMode: '自营发货',
            shippedAt: dayjs(),
            trackingNos: selectedOrders.map((order) => ({
              orderId: order.id,
              trackingNo: '',
            })),
          }}
        >
          <Form.Item label="物流公司" name="logisticsCompany">
            <Input placeholder="如：顺丰、京东、极兔" />
          </Form.Item>
          <Form.Item label="发货模式" name="shipmentMode" rules={[{ required: true }]}>
            <Select options={shipmentModes.map((item) => ({ label: item, value: item }))} />
          </Form.Item>
          <Form.Item label="发货时间" name="shippedAt" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="批次备注" name="remarks">
            <Input.TextArea rows={3} placeholder="记录这批订单的发货说明" />
          </Form.Item>
          <Form.List name="trackingNos">
            {(fields) => (
              <div style={{ display: 'grid', gap: 12 }}>
                <Typography.Text strong>逐单物流单号</Typography.Text>
                {fields.map((field, index) => {
                  const order = selectedOrders[index];
                  if (!order) {
                    return null;
                  }

                  return (
                    <Space key={field.key} align="start" style={{ display: 'flex' }}>
                      <div style={{ width: 180, paddingTop: 6 }}>
                        <Typography.Text>{order.orderNo}</Typography.Text>
                      </div>
                      <Form.Item name={[field.name, 'orderId']} hidden>
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'trackingNo']}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="可留空，后续补录" />
                      </Form.Item>
                    </Space>
                  );
                })}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
