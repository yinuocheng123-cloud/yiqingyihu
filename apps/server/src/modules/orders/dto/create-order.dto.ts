/**
 * 文件说明：新增订单 DTO。
 * 功能说明：约束订单录入最小所需字段，先聚焦客户、渠道、金额和履约状态。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customerId!: string;

  @IsString()
  @IsNotEmpty()
  orderDate!: string;

  @IsString()
  @IsNotEmpty()
  orderChannel!: string;

  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @IsString()
  @IsNotEmpty()
  paymentStatus!: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  shipmentMode?: string;

  @IsOptional()
  @IsString()
  shipmentStatus?: string;

  @IsOptional()
  @IsString()
  signStatus?: string;

  @IsOptional()
  @IsString()
  aftersaleStatus?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
