/**
 * 文件说明：独立待办中心页面。
 * 功能说明：支持按状态、类型、负责人、优先级和关键字筛选任务，并完成审核、关闭、指派、延期和优先级调整。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：任务辅助函数
 *   第三部分：页面组件
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
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
import { bulkUpdateTaskStatus, getInboxTasks, updateTask, updateTaskStatus } from '../../api/tasks';
import { getUserOptions } from '../../api/users-lite';
import { useAuthStore } from '../../store/auth-store';
import type { TaskItem } from '../../types/task';

const taskTypeOptions = [
  'LEAD_REVIEW',
  'ORDER_REVIEW',
  'SHIPMENT_PENDING',
  'FOLLOWUP_PENDING',
  'REPURCHASE_REVIEW',
  'MEMBER_REVIEW',
  'PARTNER_REVIEW',
];

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

function taskTypeLabel(taskType: string) {
  const mapping: Record<string, string> = {
    LEAD_REVIEW: '线索审核',
    ORDER_REVIEW: '订单审核',
    SHIPMENT_PENDING: '待发货',
    FOLLOWUP_PENDING: '待回访',
    REPURCHASE_REVIEW: '复购审核',
    MEMBER_REVIEW: '会员审核',
    PARTNER_REVIEW: '伙伴审核',
  };

  return mapping[taskType] ?? taskType;
}

export function TasksPage() {
  const [status, setStatus] = useState<string | undefined>();
  const [taskType, setTaskType] = useState<string | undefined>();
  const [responsibleId, setResponsibleId] = useState<string | undefined>();
  const [priority, setPriority] = useState<number | undefined>();
  const [keyword, setKeyword] = useState<string | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const tasksQuery = useQuery({
    queryKey: ['tasks', 'inbox', status, taskType, responsibleId, priority, keyword],
    queryFn: () => getInboxTasks({ status, taskType, responsibleId, priority, keyword }),
  });

  const usersQuery = useQuery({
    queryKey: ['users', 'options'],
    queryFn: getUserOptions,
  });

  const taskStatusMutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      message.success('任务状态已更新');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const taskEditMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      message.success('任务安排已更新');
      setEditingTask(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: bulkUpdateTaskStatus,
    onSuccess: () => {
      message.success('批量处理完成');
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const userOptions = (usersQuery.data ?? [])
    .filter((item) => item.status === 'ENABLED')
    .map((item) => ({
      label: item.realName,
      value: item.id,
    }));

  const columns = useMemo(
    () => [
      { title: '任务编号', dataIndex: 'taskNo', width: 180 },
      {
        title: '任务标题',
        render: (_: unknown, record: TaskItem) => <Link to={resolveTaskLink(record)}>{record.title}</Link>,
      },
      {
        title: '任务类型',
        dataIndex: 'taskType',
        width: 130,
        render: (value: string) => <Tag>{taskTypeLabel(value)}</Tag>,
      },
      { title: '状态', dataIndex: 'status', width: 120 },
      {
        title: '负责人',
        width: 120,
        render: (_: unknown, record: TaskItem) => record.responsible?.realName ?? '-',
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        width: 90,
        render: (value: number) => `P${value}`,
      },
      {
        title: '到期时间',
        dataIndex: 'dueAt',
        width: 170,
        render: (value: string | null) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
      },
      {
        title: '操作',
        width: 560,
        render: (_: unknown, record: TaskItem) => (
          <Space wrap size="small">
            <Link to={resolveTaskLink(record)}>打开</Link>
            <Button
              type="link"
              onClick={() =>
                taskStatusMutation.mutate({
                  id: record.id,
                  payload: { status: 'IN_REVIEW', note: '已进入人工审核' },
                })
              }
              disabled={record.status === 'IN_REVIEW'}
            >
              审核
            </Button>
            <Button
              type="link"
              onClick={() =>
                taskEditMutation.mutate({
                  id: record.id,
                  payload: {
                    responsibleId: currentUser?.id ?? undefined,
                    note: `任务已指派给 ${currentUser?.realName ?? '当前用户'}`,
                  },
                })
              }
            >
              指派给我
            </Button>
            <Button
              type="link"
              onClick={() => {
                const baseDate = record.dueAt ? dayjs(record.dueAt) : dayjs();
                taskEditMutation.mutate({
                  id: record.id,
                  payload: {
                    dueAt: baseDate.add(1, 'day').format('YYYY-MM-DDTHH:mm:ss'),
                    note: '任务快捷顺延 1 天',
                  },
                });
              }}
            >
              延后1天
            </Button>
            <Button
              type="link"
              onClick={() => {
                const baseDate = record.dueAt ? dayjs(record.dueAt) : dayjs();
                taskEditMutation.mutate({
                  id: record.id,
                  payload: {
                    dueAt: baseDate.add(3, 'day').format('YYYY-MM-DDTHH:mm:ss'),
                    note: '任务快捷顺延 3 天',
                  },
                });
              }}
            >
              延后3天
            </Button>
            <Button
              type="link"
              onClick={() => {
                const baseDate = record.dueAt ? dayjs(record.dueAt) : dayjs();
                taskEditMutation.mutate({
                  id: record.id,
                  payload: {
                    dueAt: baseDate.add(7, 'day').format('YYYY-MM-DDTHH:mm:ss'),
                    note: '任务快捷顺延 7 天',
                  },
                });
              }}
            >
              延后7天
            </Button>
            <Button
              type="link"
              onClick={() =>
                taskEditMutation.mutate({
                  id: record.id,
                  payload: { priority: 1, note: '任务优先级快捷调整为 P1' },
                })
              }
              disabled={record.priority === 1}
            >
              设为P1
            </Button>
            <Button
              type="link"
              onClick={() =>
                taskEditMutation.mutate({
                  id: record.id,
                  payload: { priority: 2, note: '任务优先级快捷调整为 P2' },
                })
              }
              disabled={record.priority === 2}
            >
              设为P2
            </Button>
            <Button
              type="link"
              onClick={() =>
                taskEditMutation.mutate({
                  id: record.id,
                  payload: { priority: 3, note: '任务优先级快捷调整为 P3' },
                })
              }
              disabled={record.priority === 3}
            >
              设为P3
            </Button>
            <Button
              type="link"
              onClick={() => {
                setEditingTask(record);
                form.setFieldsValue({
                  responsibleId: record.responsibleId ?? undefined,
                  dueAt: record.dueAt ? dayjs(record.dueAt) : undefined,
                  priority: record.priority,
                  note: undefined,
                });
              }}
            >
              延期/备注
            </Button>
            <Button
              type="link"
              onClick={() =>
                taskStatusMutation.mutate({
                  id: record.id,
                  payload: { status: 'DONE', note: '任务已手动关闭' },
                })
              }
            >
              关闭
            </Button>
          </Space>
        ),
      },
    ],
    [currentUser?.id, currentUser?.realName, form, taskEditMutation, taskStatusMutation],
  );

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card bordered={false} className="page-card">
        <Typography.Title level={3} className="page-title">
          待办中心
        </Typography.Title>
        <Typography.Paragraph className="page-desc">
          这里是你的主操作台。优先看任务，再决定审核、发货、回访或关闭。
        </Typography.Paragraph>
        <Space style={{ marginTop: 16, flexWrap: 'wrap' }}>
          <Select
            allowClear
            placeholder="按状态筛选"
            value={status}
            onChange={setStatus}
            style={{ width: 160 }}
            options={[
              { label: '待处理', value: 'OPEN' },
              { label: '审核中', value: 'IN_REVIEW' },
              { label: '已关闭', value: 'DONE' },
              { label: '已取消', value: 'CANCELLED' },
            ]}
          />
          <Select
            allowClear
            placeholder="按任务类型筛选"
            value={taskType}
            onChange={setTaskType}
            style={{ width: 220 }}
            options={taskTypeOptions.map((item) => ({
              label: taskTypeLabel(item),
              value: item,
            }))}
          />
          <Select
            allowClear
            placeholder="按负责人筛选"
            value={responsibleId}
            onChange={setResponsibleId}
            style={{ width: 200 }}
            loading={usersQuery.isLoading}
            options={userOptions}
          />
          <Select
            allowClear
            placeholder="按优先级筛选"
            value={priority}
            onChange={setPriority}
            style={{ width: 180 }}
            options={[
              { label: 'P1 - 今日优先', value: 1 },
              { label: 'P2 - 尽快处理', value: 2 },
              { label: 'P3 - 常规处理', value: 3 },
              { label: 'P4 - 可延后', value: 4 },
              { label: 'P5 - 观察中', value: 5 },
            ]}
          />
          <Input.Search
            allowClear
            placeholder="搜索任务编号或标题"
            style={{ width: 240 }}
            onSearch={(value) => setKeyword(value || undefined)}
            onChange={(event) => {
              if (!event.target.value) {
                setKeyword(undefined);
              }
            }}
          />
          <Button
            disabled={!selectedRowKeys.length}
            onClick={() => bulkMutation.mutate({ ids: selectedRowKeys as string[], status: 'IN_REVIEW' })}
          >
            批量审核
          </Button>
          <Button
            disabled={!selectedRowKeys.length}
            onClick={() => bulkMutation.mutate({ ids: selectedRowKeys as string[], status: 'DONE' })}
          >
            批量关闭
          </Button>
        </Space>
      </Card>

      <Card bordered={false}>
        <Table<TaskItem>
          rowKey="id"
          loading={tasksQuery.isLoading}
          columns={columns}
          dataSource={tasksQuery.data ?? []}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 1800 }}
        />
      </Card>

      <Modal
        title="更新任务安排"
        open={Boolean(editingTask)}
        onCancel={() => {
          setEditingTask(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={taskEditMutation.isPending}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (!editingTask) {
              return;
            }

            taskEditMutation.mutate({
              id: editingTask.id,
              payload: {
                responsibleId: values.responsibleId,
                dueAt: values.dueAt ? values.dueAt.format('YYYY-MM-DDTHH:mm:ss') : '',
                priority: values.priority,
                note: values.note,
              },
            });
          }}
        >
          <Form.Item label="负责人" name="responsibleId">
            <Select allowClear placeholder="请选择负责人" loading={usersQuery.isLoading} options={userOptions} />
          </Form.Item>
          <Form.Item label="延期到" name="dueAt">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="优先级" name="priority">
            <Select
              placeholder="请选择优先级"
              options={[
                { label: 'P1 - 今日优先', value: 1 },
                { label: 'P2 - 尽快处理', value: 2 },
                { label: 'P3 - 常规处理', value: 3 },
                { label: 'P4 - 可延后', value: 4 },
                { label: 'P5 - 观察中', value: 5 },
              ]}
            />
          </Form.Item>
          <Form.Item label="备注" name="note">
            <Input.TextArea rows={4} placeholder="补充本次安排原因、延期说明或跟进备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
