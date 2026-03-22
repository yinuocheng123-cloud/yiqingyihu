/**
 * 文件说明：更新内容素材 DTO。
 * 功能说明：支持编辑素材基本信息与发布状态。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { PartialType } from '@nestjs/swagger';
import { CreateContentAssetDto } from './create-content-asset.dto';

export class UpdateContentAssetDto extends PartialType(CreateContentAssetDto) {}
