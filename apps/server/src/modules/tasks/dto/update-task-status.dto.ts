/**
 * 文件说明：任务状态更新 DTO。
 * 功能说明：支持审核和关闭任务时更新状态与备注。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsOptional, IsString } from 'class-validator';

export class UpdateTaskStatusDto {
  @IsString()
  status!: 'IN_REVIEW' | 'DONE' | 'CANCELLED';

  @IsOptional()
  @IsString()
  note?: string;
}
