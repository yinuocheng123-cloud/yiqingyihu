/**
 * 文件说明：内容素材页面。
 * 功能说明：提供素材列表和新增录入能力，承接客户原话与回访反馈沉淀。
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
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { createContentAsset, getContentAssets } from '../../api/content-assets';
import type { ContentAsset, ContentAssetPayload } from '../../types/content-asset';

export function ContentAssetsPage() {
  const [keyword, setKeyword] = useState('');
  const [searchText, setSearchText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const assetsQuery = useQuery({
    queryKey: ['content-assets', keyword],
    queryFn: () => getContentAssets(keyword || undefined),
  });

  const createMutation = useMutation({
    mutationFn: createContentAsset,
    onSuccess: () => {
      message.success('内容素材已保存');
      setDrawerOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['content-assets'] });
    },
  });

  const columns = useMemo(
    () => [
      { title: '素材编号', dataIndex: 'assetNo', width: 180 },
      {
        title: '日期',
        dataIndex: 'assetDate',
        render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
        width: 120,
      },
      { title: '来源类型', dataIndex: 'sourceType', width: 120 },
      { title: '客户痛点', dataIndex: 'painPoint', width: 180 },
      { title: '客户原话', dataIndex: 'customerQuote', width: 260 },
      { title: '内容角度', dataIndex: 'contentAngle', width: 160 },
      { title: '标题钩子', dataIndex: 'titleHook', width: 220 },
      { title: '适合平台', dataIndex: 'targetPlatform', width: 120 },
      {
        title: '发布状态',
        dataIndex: 'isPublished',
        render: (value: boolean) => (value ? <Tag color="green">已发布</Tag> : '未发布'),
        width: 100,
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
              内容素材管理
            </Typography.Title>
            <Typography.Paragraph className="page-desc">
              把客户原话、痛点、回访反馈和平台角度沉淀为可复用的内容资产。
            </Typography.Paragraph>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
            新增素材
          </Button>
        </Space>

        <Space style={{ marginTop: 16 }}>
          <Input
            placeholder="搜索素材编号、痛点、客户原话、标题钩子"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={{ width: 360 }}
            onPressEnter={() => setKeyword(searchText.trim())}
          />
          <Button icon={<SearchOutlined />} onClick={() => setKeyword(searchText.trim())}>
            搜索
          </Button>
        </Space>
      </Card>

      <Card bordered={false}>
        <Table<ContentAsset>
          rowKey="id"
          loading={assetsQuery.isLoading}
          columns={columns}
          dataSource={assetsQuery.data ?? []}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1500 }}
        />
      </Card>

      <Drawer
        title="新增内容素材"
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            assetDate: dayjs(),
            sourceType: '回访记录',
            isPublished: false,
          }}
          onFinish={(values) =>
            createMutation.mutate({
              ...values,
              assetDate: values.assetDate?.format('YYYY-MM-DDTHH:mm:ss'),
            } as ContentAssetPayload)
          }
        >
          <Form.Item label="日期" name="assetDate">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="来源类型" name="sourceType" rules={[{ required: true }]}>
            <Input placeholder="如：回访记录、售后反馈、客户咨询" />
          </Form.Item>
          <Form.Item label="客户类型" name="customerType">
            <Input placeholder="如：个人客户、企业客户、代理意向" />
          </Form.Item>
          <Form.Item label="客户痛点" name="painPoint">
            <Input placeholder="记录核心痛点" />
          </Form.Item>
          <Form.Item label="客户原话" name="customerQuote">
            <Input.TextArea rows={3} placeholder="记录可直接用于内容的原话" />
          </Form.Item>
          <Form.Item label="使用场景" name="usageScenario">
            <Input placeholder="如：厨房清洁、婴童护理、办公室场景" />
          </Form.Item>
          <Form.Item label="反馈结果" name="feedbackResult">
            <Input placeholder="如：反馈良好、有使用问题" />
          </Form.Item>
          <Form.Item label="内容角度" name="contentAngle">
            <Input placeholder="如：测评、对比、避坑、科普" />
          </Form.Item>
          <Form.Item label="标题钩子" name="titleHook">
            <Input placeholder="如：为什么你家的清洁越做越脏？" />
          </Form.Item>
          <Form.Item label="适合平台" name="targetPlatform">
            <Input placeholder="如：小红书、视频号、朋友圈" />
          </Form.Item>
          <Form.Item label="内容形式" name="contentFormat">
            <Input placeholder="如：图文、短视频、问答" />
          </Form.Item>
          <Form.Item label="发布链接" name="publishUrl">
            <Input placeholder="如已发布可填写链接" />
          </Form.Item>
          <Form.Item label="备注" name="remarks">
            <Input.TextArea rows={4} placeholder="记录补充观察与后续可延展方向" />
          </Form.Item>
          <Form.Item name="isPublished" valuePropName="checked">
            <Checkbox>已发布</Checkbox>
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={createMutation.isPending}>
            保存素材
          </Button>
        </Form>
      </Drawer>
    </div>
  );
}
