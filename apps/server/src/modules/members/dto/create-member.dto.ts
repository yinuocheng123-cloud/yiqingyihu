/**
 * 文件说明：新增会员 DTO。
 * 功能说明：支持从客户转会员时录入最小必要信息。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsOptional()
  @IsString()
  joinedAt?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  benefitStatus?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
