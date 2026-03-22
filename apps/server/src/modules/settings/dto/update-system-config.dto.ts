/**
 * 文件说明：更新系统配置 DTO。
 * 功能说明：支持编辑配置项标签、值和状态。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { PartialType } from '@nestjs/swagger';
import { CreateSystemConfigDto } from './create-system-config.dto';

export class UpdateSystemConfigDto extends PartialType(CreateSystemConfigDto) {}
