/**
 * 文件说明：更新订单 DTO。
 * 功能说明：支持后续按需编辑订单主信息和状态字段。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
