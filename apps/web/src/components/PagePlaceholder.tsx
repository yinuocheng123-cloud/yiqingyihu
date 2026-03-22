/**
 * 文件说明：模块占位页组件。
 * 功能说明：在业务模块尚未细化前，用统一样式表达当前模块定位和后续方向。
 *
 * 结构概览：
 *   第一部分：组件定义
 */
import { Card, Space, Tag, Typography } from 'antd';

interface PagePlaceholderProps {
  title: string;
  description: string;
  tags?: string[];
}

export function PagePlaceholder({
  title,
  description,
  tags = [],
}: PagePlaceholderProps) {
  return (
    <Card bordered={false} className="page-card">
      <Typography.Title level={3} className="page-title">
        {title}
      </Typography.Title>
      <Typography.Paragraph className="page-desc">
        {description}
      </Typography.Paragraph>
      <Space wrap style={{ marginTop: 16 }}>
        {tags.map((tag) => (
          <Tag color="green" key={tag}>
            {tag}
          </Tag>
        ))}
      </Space>
    </Card>
  );
}
