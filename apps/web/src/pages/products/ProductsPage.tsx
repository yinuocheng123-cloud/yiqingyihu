/**
 * 文件说明：产品管理模块占位页。
 * 功能说明：说明产品管理模块在第一阶段中的业务定位。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：页面组件
 */
import { PagePlaceholder } from '../../components/PagePlaceholder';

export function ProductsPage() {
  return (
    <PagePlaceholder
      title="产品管理"
      description="后续将管理严选产品资料、卖点、FAQ、场景、复购周期和供应商信息。"
      tags={['卖点资料', '复购周期', '供应商']}
    />
  );
}
