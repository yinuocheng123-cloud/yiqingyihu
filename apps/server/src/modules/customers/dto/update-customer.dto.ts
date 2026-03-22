/**
 * 文件说明：更新客户 DTO。
 * 功能说明：复用新增字段集合，支持后续按需编辑客户信息。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
