/**
 * 文件说明：新增客户 DTO。
 * 功能说明：约束客户建档接口所需的核心字段，先聚焦真实业务最常用录入项。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  wechatId?: string;

  @IsOptional()
  @IsString()
  wecomNickname?: string;

  @IsString()
  sourceChannel!: string;

  @IsString()
  customerType!: string;

  @IsOptional()
  @IsString()
  lifecycleStage?: string;

  @IsOptional()
  @IsString()
  identityTag?: string;

  @IsOptional()
  @IsString()
  followupStatus?: string;

  @IsOptional()
  @IsString()
  nextFollowupAt?: string;

  @IsOptional()
  @IsBoolean()
  hasPartnerIntent?: boolean;

  @IsOptional()
  @IsBoolean()
  isEnterprise?: boolean;

  @IsOptional()
  @IsString()
  remarks?: string;
}
