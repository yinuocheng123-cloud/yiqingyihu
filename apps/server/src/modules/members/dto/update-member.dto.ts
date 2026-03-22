/**
 * 文件说明：更新会员 DTO。
 * 功能说明：支持编辑会员状态、来源和备注等信息。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { PartialType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {}
