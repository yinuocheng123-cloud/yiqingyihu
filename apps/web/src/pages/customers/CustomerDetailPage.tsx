/**
 * 文件说明：客户详情页面。
 * 功能说明：展示客户基础资料、消费汇总、历史订单和回访摘要，支撑客户视角复盘。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：页面组件
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Descriptions, Empty, Space, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { Link, useParams } from 'react-router-dom';
import { getCustomerDetail } from '../../api/customers';
import { createMember } from '../../api/members';
import { createPartner } from '../../api/partners';

export function CustomerDetailPage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const detailQuery = useQuery({
    queryKey: ['customer-detail', id],
    queryFn: () => getCustomerDetail(id),
    enabled: Boolean(id),
  });

  const memberMutation = useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      message.success('已转为会员');
      queryClient.invalidateQueries({ queryKey: ['customer-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const partnerMutation = useMutation({
    mutationFn: createPartner,
    onSuccess: () => {
      message.success('已转为伙伴');
      queryClient.invalidateQueries({ queryKey: ['customer-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const customer = detailQuery.data;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card bordered={false} className="page-card">
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <div>
            <Typography.Title level={3} className="page-title">
              客户详情
            </Typography.Title>
            <Typography.Paragraph className="page-desc">
              从客户视角查看来源、生命周期、消费汇总和关联订单，方便后续跟进与复购判断。
            </Typography.Paragraph>
          </div>
          <Space>
            <Button
              onClick={() =>
                customer &&
                partnerMutation.mutate({
                  customerId: customer.id,
                  name: customer.name,
                  mobile: customer.mobile ?? undefined,
                  wechatId: customer.wechatId ?? undefined,
                  sourceType: '客户详情转化',
                  identityType: '分销',
                })
              }
              loading={partnerMutation.isPending}
            >
              转为伙伴
            </Button>
            <Button
              type="primary"
              disabled={!customer || customer.isMember}
              loading={memberMutation.isPending}
              onClick={() =>
                customer &&
                memberMutation.mutate({
                  customerId: customer.id,
                  source: '客户详情转化',
                })
              }
            >
              {customer?.isMember ? '已是会员' : '转为会员'}
            </Button>
          </Space>
        </Space>
      </Card>

      <Card bordered={false} loading={detailQuery.isLoading}>
        {customer ? (
          <Descriptions column={3} bordered>
            <Descriptions.Item label="客户编号">{customer.customerNo}</Descriptions.Item>
            <Descriptions.Item label="姓名/昵称">{customer.name}</Descriptions.Item>
            <Descriptions.Item label="手机号">{customer.mobile || '-'}</Descriptions.Item>
            <Descriptions.Item label="来源渠道">{customer.sourceChannel}</Descriptions.Item>
            <Descriptions.Item label="客户类型">{customer.customerType}</Descriptions.Item>
            <Descriptions.Item label="生命周期">
              <Tag color="green">{customer.lifecycleStage}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="跟进状态">
              <Tag color="blue">{customer.followupStatus}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="累计购买次数">{customer.purchaseCount}</Descriptions.Item>
            <Descriptions.Item label="累计消费金额">¥{customer.totalAmount}</Descriptions.Item>
            <Descriptions.Item label="首购时间">
              {customer.firstOrderAt ? dayjs(customer.firstOrderAt).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="最近购买时间">
              {customer.lastOrderAt ? dayjs(customer.lastOrderAt).format('YYYY-MM-DD HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="代理意向">
              {customer.hasPartnerIntent ? '是' : '否'}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>
              {customer.remarks || '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty description="未找到客户信息" />
        )}
      </Card>

      <Card bordered={false} title="历史订单">
        <Table
          rowKey="id"
          pagination={false}
          dataSource={customer?.orders ?? []}
          locale={{ emptyText: '暂无订单' }}
          columns={[
            {
              title: '订单编号',
              dataIndex: 'orderNo',
              render: (value: string, record: { id: string }) => (
                <Link to={`/orders/${record.id}`}>{value}</Link>
              ),
            },
            {
              title: '下单时间',
              dataIndex: 'orderDate',
              render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
            },
            { title: '渠道', dataIndex: 'orderChannel' },
            { title: '金额', dataIndex: 'totalAmount', render: (value: number) => `¥${value}` },
            { title: '收款状态', dataIndex: 'paymentStatus' },
            { title: '发货状态', dataIndex: 'shipmentStatus' },
            { title: '签收状态', dataIndex: 'signStatus' },
          ]}
        />
      </Card>

      <Card bordered={false} title="回访摘要">
        {customer?.followups?.length ? (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            {customer.followups.map((item) => (
              <Card key={item.id} size="small">
                <Space direction="vertical" size={4}>
                  <Typography.Text>回访编号：{item.followupNo}</Typography.Text>
                  <Typography.Text>
                    关联订单：
                    {item.order ? <Link to={`/orders/${item.order.id}`}>{item.order.orderNo}</Link> : '-'}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    创建时间：{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                  </Typography.Text>
                  <Typography.Text>
                    第一次：{item.firstResult || '-'}；第二次：{item.secondResult || '-'}；第三次：
                    {item.thirdResult || '-'}
                  </Typography.Text>
                  <Typography.Text>
                    满意度：{item.satisfactionScore ?? '-'}，可复购：
                    {item.isRepurchaseFit ? '是' : '否'}，是否已复购：{item.hasRepurchase ? '是' : '否'}
                  </Typography.Text>
                </Space>
              </Card>
            ))}
          </Space>
        ) : (
          <Empty description="暂无回访记录" />
        )}
      </Card>
    </div>
  );
}
