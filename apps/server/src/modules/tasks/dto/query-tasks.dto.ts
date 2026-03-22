/**
 * 文件说明：任务查询 DTO。
 * 功能说明：支持待办中心按状态、类型和优先级筛选任务。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryTasksDto {
  @IsOptional()
  @IsString()
  status?: 'OPEN' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';

  @IsOptional()
  @IsString()
  taskType?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  priority?: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}
