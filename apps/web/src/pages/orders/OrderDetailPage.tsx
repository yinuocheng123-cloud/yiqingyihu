/**
 * 文件说明：订单详情页面。
 * 功能说明：展示订单主信息和关联客户，作为后续发货、回访和售后扩展入口。
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
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderDetail } from '../../api/orders';
import { createShipment, updateShipment } from '../../api/shipments';
import type { ShipmentPayload, Shipment } from '../../types/shipment';

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const detailQuery = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => getOrderDetail(id),
    enabled: Boolean(id),
  });

  const createMutation = useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      message.success('发货记录已保存');
      handleClose();
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ shipmentId, payload }: { shipmentId: string; payload: ShipmentPayload }) =>
      updateShipment(shipmentId, payload),
    onSuccess: () => {
      message.success('发货记录已更新');
      handleClose();
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const order = detailQuery.data;

  function handleClose() {
    setDrawerOpen(false);
    setEditingShipment(null);
    form.resetFields();
  }

  function handleEditShipment(record: Shipment) {
    setEditingShipment(record);
    setDrawerOpen(true);
    form.setFieldsValue({
      logisticsCompany: record.logisticsCompany,
      trackingNo: record.trackingNo,
      shipmentMode: record.shipmentMode,
      shipmentStatus: record.shipmentStatus,
      shippedAt: record.shippedAt ? dayjs(record.shippedAt) : undefined,
      signedAt: record.signedAt ? dayjs(record.signedAt) : undefined,
      remarks: record.remarks,
    });
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card bordered={false} className="page-card">
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <div>
            <Typography.Title level={3} className="page-title">
              订单详情
            </Typography.Title>
            <Typography.Paragraph className="page-desc">
              当前已接发货记录与物流信息，方便个人在一个页面内完成履约跟踪。
            </Typography.Paragraph>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setDrawerOpen(true)}
          >
            新增发货
          </Button>
        </Space>
      </Card>

      <Card bordered={false} loading={detailQuery.isLoading}>
        {order ? (
          <Descriptions column={3} bordered>
            <Descriptions.Item label="订单编号">{order.orderNo}</Descriptions.Item>
            <Descriptions.Item label="下单时间">
              {dayjs(order.orderDate).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="成交渠道">{order.orderChannel}</Descriptions.Item>
            <Descriptions.Item label="客户">
              <Link to={`/customers/${order.customer.id}`}>{order.customer.name}</Link>
            </Descriptions.Item>
            <Descriptions.Item label="客户编号">{order.customer.customerNo}</Descriptions.Item>
            <Descriptions.Item label="订单金额">¥{order.totalAmount}</Descriptions.Item>
            <Descriptions.Item label="收款状态">
              <Tag color="green">{order.paymentStatus}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="发货状态">
              <Tag color="blue">{order.shipmentStatus}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="签收状态">
              <Tag color="purple">{order.signStatus}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="售后状态">{order.aftersaleStatus}</Descriptions.Item>
            <Descriptions.Item label="收款方式">{order.paymentMethod || '-'}</Descriptions.Item>
            <Descriptions.Item label="发货模式">{order.shipmentMode || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>
              {order.remarks || '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="未找到订单信息" />
        )}
      </Card>

      <Card bordered={false} title="发货记录">
        <Table<Shipment>
          rowKey="id"
          pagination={false}
          dataSource={order?.shipments ?? []}
          locale={{ emptyText: '暂无发货记录' }}
          columns={[
            { title: '发货单号', dataIndex: 'shipmentNo' },
            { title: '物流公司', dataIndex: 'logisticsCompany', render: (value: string) => value || '-' },
            { title: '物流单号', dataIndex: 'trackingNo', render: (value: string) => value || '-' },
            { title: '发货模式', dataIndex: 'shipmentMode', render: (value: string) => value || '-' },
            { title: '发货状态', dataIndex: 'shipmentStatus' },
            {
              title: '发货时间',
              dataIndex: 'shippedAt',
              render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
            },
            {
              title: '签收时间',
              dataIndex: 'signedAt',
              render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
            },
            {
              title: '操作',
              render: (_: unknown, record: Shipment) => (
                <Button type="link" onClick={() => handleEditShipment(record)}>
                  编辑
                </Button>
              ),
            },
          ]}
        />
      </Card>

      <Drawer
        title={editingShipment ? '编辑发货记录' : '新增发货记录'}
        width={520}
        open={drawerOpen}
        onClose={handleClose}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            shipmentMode: order?.shipmentMode ?? '自营发货',
            shipmentStatus: '已发货',
            shippedAt: dayjs(),
          }}
          onFinish={(values) => {
            const payload: ShipmentPayload = {
              orderId: id,
              logisticsCompany: values.logisticsCompany,
              trackingNo: values.trackingNo,
              shipmentMode: values.shipmentMode,
              shipmentStatus: values.shipmentStatus,
              shippedAt: values.shippedAt?.format('YYYY-MM-DDTHH:mm:ss'),
              signedAt: values.signedAt?.format('YYYY-MM-DDTHH:mm:ss'),
              remarks: values.remarks,
            };

            if (editingShipment) {
              updateMutation.mutate({ shipmentId: editingShipment.id, payload });
              return;
            }

            createMutation.mutate(payload);
          }}
        >
          <Form.Item label="物流公司" name="logisticsCompany">
            <Input placeholder="请输入物流公司" />
          </Form.Item>
          <Form.Item label="物流单号" name="trackingNo">
            <Input placeholder="请输入物流单号" />
          </Form.Item>
          <Form.Item label="发货模式" name="shipmentMode">
            <Input placeholder="如：自营发货、供应商代发" />
          </Form.Item>
          <Form.Item label="发货状态" name="shipmentStatus">
            <Input placeholder="如：已发货、运输中、已签收" />
          </Form.Item>
          <Form.Item label="发货时间" name="shippedAt">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="签收时间" name="signedAt">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="备注" name="remarks">
            <Input.TextArea rows={4} placeholder="记录发货说明和异常情况" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={createMutation.isPending || updateMutation.isPending}
          >
            保存发货记录
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
