/**
 * 文件说明：新增内容素材 DTO。
 * 功能说明：支持沉淀客户原话、场景、平台和发布状态等核心字段。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateContentAssetDto {
  @IsOptional()
  @IsString()
  assetDate?: string;

  @IsString()
  sourceType!: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  customerType?: string;

  @IsOptional()
  @IsString()
  painPoint?: string;

  @IsOptional()
  @IsString()
  customerQuote?: string;

  @IsOptional()
  @IsString()
  usageScenario?: string;

  @IsOptional()
  @IsString()
  feedbackResult?: string;

  @IsOptional()
  @IsString()
  contentAngle?: string;

  @IsOptional()
  @IsString()
  titleHook?: string;

  @IsOptional()
  @IsString()
  targetPlatform?: string;

  @IsOptional()
  @IsString()
  contentFormat?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  publishUrl?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
