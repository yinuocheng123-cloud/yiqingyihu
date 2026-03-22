/**
 * 文件说明：内容素材类型定义。
 * 功能说明：统一素材列表与表单的数据结构。
 *
 * 结构概览：
 *   第一部分：类型定义
 */
export interface ContentAsset {
  id: string;
  assetNo: string;
  assetDate: string;
  sourceType: string;
  customerType?: string | null;
  painPoint?: string | null;
  customerQuote?: string | null;
  usageScenario?: string | null;
  feedbackResult?: string | null;
  contentAngle?: string | null;
  titleHook?: string | null;
  targetPlatform?: string | null;
  contentFormat?: string | null;
  isPublished: boolean;
  publishUrl?: string | null;
  remarks?: string | null;
}

export interface ContentAssetPayload {
  assetDate?: string;
  sourceType: string;
  customerType?: string;
  painPoint?: string;
  customerQuote?: string;
  usageScenario?: string;
  feedbackResult?: string;
  contentAngle?: string;
  titleHook?: string;
  targetPlatform?: string;
  contentFormat?: string;
  isPublished?: boolean;
  publishUrl?: string;
  remarks?: string;
}
