/**
 * 文件说明：新增系统配置 DTO。
 * 功能说明：支持录入基础配置项，如来源渠道、客户类型、产品类别等。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSystemConfigDto {
  @IsString()
  @IsNotEmpty()
  configType!: string;

  @IsString()
  @IsNotEmpty()
  configKey!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
