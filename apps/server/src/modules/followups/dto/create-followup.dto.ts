/**
 * 文件说明：新增回访 DTO。
 * 功能说明：约束回访建档所需的核心字段，支持三次回访和复购判断。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateFollowupDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsOptional()
  @IsString()
  firstFollowupAt?: string;

  @IsOptional()
  @IsString()
  firstResult?: string;

  @IsOptional()
  @IsString()
  secondFollowupAt?: string;

  @IsOptional()
  @IsString()
  secondResult?: string;

  @IsOptional()
  @IsString()
  thirdFollowupAt?: string;

  @IsOptional()
  @IsString()
  thirdResult?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  satisfactionScore?: number;

  @IsOptional()
  @IsBoolean()
  isRepurchaseFit?: boolean;

  @IsOptional()
  @IsString()
  expectedRepurchaseAt?: string;

  @IsOptional()
  @IsBoolean()
  hasRepurchase?: boolean;

  @IsOptional()
  @IsBoolean()
  convertedToMember?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPartnerIntent?: boolean;

  @IsOptional()
  @IsString()
  remarks?: string;
}
