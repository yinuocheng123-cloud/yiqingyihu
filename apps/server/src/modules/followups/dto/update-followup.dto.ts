/**
 * 文件说明：更新回访 DTO。
 * 功能说明：支持按需更新三次回访结果和复购相关字段。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { PartialType } from '@nestjs/swagger';
import { CreateFollowupDto } from './create-followup.dto';

export class UpdateFollowupDto extends PartialType(CreateFollowupDto) {}
