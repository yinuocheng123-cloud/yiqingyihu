/**
 * 文件说明：新增伙伴 DTO。
 * 功能说明：支持录入代理/分销伙伴档案或从客户转化伙伴。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePartnerDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  wechatId?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsString()
  identityType!: string;

  @IsString()
  sourceType!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  dealSummary?: string;

  @IsOptional()
  @IsBoolean()
  attendedTraining?: boolean;

  @IsOptional()
  @IsString()
  trainingAt?: string;

  @IsOptional()
  @IsString()
  activationStatus?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
