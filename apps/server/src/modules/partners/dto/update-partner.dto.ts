/**
 * 文件说明：更新伙伴 DTO。
 * 功能说明：支持编辑伙伴沟通、培训和合作状态。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { PartialType } from '@nestjs/swagger';
import { CreatePartnerDto } from './create-partner.dto';

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {}
