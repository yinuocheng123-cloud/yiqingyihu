/**
 * 文件说明：新增发货 DTO。
 * 功能说明：支持录入发货记录、物流信息和签收状态。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsOptional()
  @IsString()
  logisticsCompany?: string;

  @IsOptional()
  @IsString()
  trackingNo?: string;

  @IsOptional()
  @IsString()
  shipmentMode?: string;

  @IsOptional()
  @IsString()
  shipmentStatus?: string;

  @IsOptional()
  @IsString()
  shippedAt?: string;

  @IsOptional()
  @IsString()
  signedAt?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
