/**
 * 文件说明：更新发货 DTO。
 * 功能说明：支持编辑物流、发货和签收状态。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { PartialType } from '@nestjs/swagger';
import { CreateShipmentDto } from './create-shipment.dto';

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {}
