/**
 * 文件说明：首页仪表盘。
 * 功能说明：展示经营概览、待办提醒和负责人视角的任务摘要，让个人使用时一进系统就知道先做什么。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：页面辅助函数
 *   第三部分：页面组件
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Col, List, Row, Space, Statistic, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { getDashboardOverview, getDashboardReminders } from '../../api/dashboard';
import { getInboxTasks, updateTaskStatus } from '../../api/tasks';
import { useAuthStore } from '../../store/auth-store';
import type { TaskItem } from '../../types/task';

function renderDate(value?: string | null) {
  return value ? dayjs(value).format('MM-DD HH:mm') : '-';
}

function resolveTaskLink(task: TaskItem) {
  if (task.sourceType === 'customer') {
    return `/customers/${task.sourceId}`;
  }
  if (task.sourceType === 'order') {
    return `/orders/${task.sourceId}`;
  }
  if (task.sourceType === 'followup' && task.payload?.customerId) {
    return `/customers/${String(task.payload.customerId)}`;
  }
  return '/dashboard';
}

function resolveTaskTag(taskType: string) {
  const mapping: Record<string, { label: string; color: string }> = {
    LEAD_REVIEW: { label: '线索审核', color: 'blue' },
    ORDER_REVIEW: { label: '订单审核', color: 'purple' },
    SHIPMENT_PENDING: { label: '待发货', color: 'orange' },
    FOLLOWUP_PENDING: { label: '待回访', color: 'cyan' },
    REPURCHASE_REVIEW: { label: '复购审核', color: 'green' },
    MEMBER_REVIEW: { label: '会员审核', color: 'gold' },
    PARTNER_REVIEW: { label: '伙伴审核', color: 'magenta' },
  };
  return mapping[taskType] ?? { label: taskType, color: 'default' };
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const overviewQuery = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: getDashboardOverview,
  });

  const remindersQuery = useQuery({
    queryKey: ['dashboard', 'reminders'],
    queryFn: getDashboardReminders,
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', 'inbox'],
    queryFn: () => getInboxTasks(),
  });

  const taskMutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      message.success('任务状态已更新');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const overview = overviewQuery.data;
  const reminders = remindersQuery.data;
  const allTasks = tasksQuery.data ?? [];
  const myTasks = allTasks.filter((task) => task.responsibleId === currentUser?.id);
  const myUrgentTasks = myTasks.filter((task) => task.priority <= 2).slice(0, 5);
  const unassignedTasks = allTasks.filter((task) => !task.responsibleId).slice(0, 5);

  const cards = [
    { title: '客户总数', value: overview?.customerCount ?? 0 },
    { title: '已购客户', value: overview?.purchasedCustomers ?? 0 },
    { title: '复购客户', value: overview?.repurchaseCustomers ?? 0 },
    { title: '会员人数', value: overview?.memberCount ?? 0 },
    { title: '代理意向', value: overview?.partnerIntentCount ?? 0 },
    { title: '订单数', value: overview?.orderCount ?? 0 },
    { title: '累计成交额', value: overview?.totalRevenue ?? 0, prefix: '¥' },
    { title: '回访记录', value: overview?.followupCount ?? 0 },
    { title: '待办任务', value: allTasks.length },
    { title: '我的待办', value: myTasks.length },
    { title: '我的紧急任务', value: myTasks.filter((task) => task.priority <= 2).length },
  ];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Row gutter={[16, 16]}>
        {cards.map((item) => (
          <Col xs={24} sm={12} lg={6} key={item.title}>
            <Card bordered={false} loading={overviewQuery.isLoading || tasksQuery.isLoading}>
              <Statistic title={item.title} value={item.value} prefix={item.prefix} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false} title="待办工作台" loading={tasksQuery.isLoading}>
        <Space style={{ marginBottom: 16 }}>
          <Link to="/tasks">
            <Button type="primary">进入待办中心</Button>
          </Link>
        </Space>
        <List
          locale={{ emptyText: '当前没有待处理任务，可以安心去发内容或复盘。' }}
          dataSource={allTasks.slice(0, 6)}
          renderItem={(task) => {
            const tag = resolveTaskTag(task.taskType);
            return (
              <List.Item
                actions={[
                  <Button
                    key="review"
                    type="link"
                    onClick={() =>
                      taskMutation.mutate({
                        id: task.id,
                        payload: { status: 'IN_REVIEW', note: '已进入人工审核' },
                      })
                    }
                    disabled={task.status === 'IN_REVIEW'}
                  >
                    审核
                  </Button>,
                  <Button
                    key="done"
                    type="link"
                    onClick={() =>
                      taskMutation.mutate({
                        id: task.id,
                        payload: { status: 'DONE', note: '任务已手动关闭' },
                      })
                    }
                  >
                    关闭
                  </Button>,
                  <Link key="open" to={resolveTaskLink(task)}>
                    打开
                  </Link>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={tag.color}>{tag.label}</Tag>
                      <span>{task.title}</span>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      <Typography.Text type="secondary">
                        {task.description || '系统自动生成待办'}
                      </Typography.Text>
                      <Typography.Text type="secondary">
                        优先级：P{task.priority} · 到期：{renderDate(task.dueAt)} · 状态：{task.status}
                      </Typography.Text>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            title={`我的待办摘要${currentUser?.realName ? ` · ${currentUser.realName}` : ''}`}
            loading={tasksQuery.isLoading}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Space size={24} wrap>
                <Typography.Text>待处理：{myTasks.length}</Typography.Text>
                <Typography.Text>紧急：{myTasks.filter((task) => task.priority <= 2).length}</Typography.Text>
                <Typography.Text>审核中：{myTasks.filter((task) => task.status === 'IN_REVIEW').length}</Typography.Text>
              </Space>
              <List
                locale={{ emptyText: '当前没有指派给你的任务' }}
                dataSource={myUrgentTasks}
                renderItem={(task) => {
                  const tag = resolveTaskTag(task.taskType);
                  return (
                    <List.Item
                      actions={[
                        <Button
                          key="done"
                          type="link"
                          onClick={() =>
                            taskMutation.mutate({
                              id: task.id,
                              payload: { status: 'DONE', note: '首页快捷关闭任务' },
                            })
                          }
                        >
                          关闭
                        </Button>,
                        <Link key="open" to={resolveTaskLink(task)}>
                          打开
                        </Link>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag color={tag.color}>{tag.label}</Tag>
                            <span>{task.title}</span>
                          </Space>
                        }
                        description={`P${task.priority} · 到期 ${renderDate(task.dueAt)} · ${task.status}`}
                      />
                    </List.Item>
                  );
                }}
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="待领取任务" loading={tasksQuery.isLoading}>
            <List
              locale={{ emptyText: '当前没有未指派任务' }}
              dataSource={unassignedTasks}
              renderItem={(task) => {
                const tag = resolveTaskTag(task.taskType);
                return (
                  <List.Item
                    actions={[
                      <Button
                        key="review"
                        type="link"
                        onClick={() =>
                          taskMutation.mutate({
                            id: task.id,
                            payload: { status: 'IN_REVIEW', note: '首页快捷进入审核' },
                          })
                        }
                        disabled={task.status === 'IN_REVIEW'}
                      >
                        审核
                      </Button>,
                      <Link key="open" to={resolveTaskLink(task)}>
                        打开
                      </Link>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color={tag.color}>{tag.label}</Tag>
                          <span>{task.title}</span>
                        </Space>
                      }
                      description={`P${task.priority} · 到期 ${renderDate(task.dueAt)} · 未指派`}
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="待跟进客户" loading={remindersQuery.isLoading}>
            <List
              locale={{ emptyText: '暂无待跟进客户' }}
              dataSource={reminders?.pendingCustomers ?? []}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" size={2}>
                    <Link to={`/customers/${item.id}`}>{item.name}</Link>
                    <Typography.Text type="secondary">
                      {item.customerNo} · 状态：{item.followupStatus} · 下次跟进：{renderDate(item.nextFollowupAt)}
                    </Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="待回访订单" loading={remindersQuery.isLoading}>
            <List
              locale={{ emptyText: '暂无待回访订单' }}
              dataSource={reminders?.pendingFollowups ?? []}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" size={2}>
                    <Link to={`/orders/${item.id}`}>{item.orderNo}</Link>
                    <Typography.Text type="secondary">
                      {item.customer.name} · {dayjs(item.orderDate).format('MM-DD HH:mm')} · {item.followupStatus}
                    </Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="预计复购提醒" loading={remindersQuery.isLoading}>
            <List
              locale={{ emptyText: '暂无预计复购提醒' }}
              dataSource={reminders?.pendingRepurchases ?? []}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" size={2}>
                    <Link to={`/customers/${item.customer.id}`}>{item.customer.name}</Link>
                    <Typography.Text type="secondary">
                      关联订单 {item.order.orderNo} · 预计复购：{renderDate(item.expectedRepurchaseAt)}
                    </Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="待转会员客户" loading={remindersQuery.isLoading}>
            <List
              locale={{ emptyText: '暂无待转会员客户' }}
              dataSource={reminders?.pendingMembers ?? []}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" size={2}>
                    <Link to={`/customers/${item.customer.id}`}>{item.customer.name}</Link>
                    <Space>
                      <Typography.Text type="secondary">来源订单 {item.order.orderNo}</Typography.Text>
                      <Tag color="gold">会员机会</Tag>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
