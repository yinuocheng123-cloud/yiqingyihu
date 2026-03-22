/**
 * 文件说明：任务编辑 DTO。
 * 功能说明：支持更新任务负责人、到期时间和补充备注。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  responsibleId?: string;

  @IsOptional()
  @IsString()
  dueAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
