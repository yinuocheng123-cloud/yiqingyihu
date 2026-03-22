/**
 * 文件说明：批量更新任务 DTO。
 * 功能说明：支持待办中心批量审核或关闭任务。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsArray, IsString } from 'class-validator';

export class BulkUpdateTasksDto {
  @IsArray()
  ids!: string[];

  @IsString()
  status!: 'IN_REVIEW' | 'DONE' | 'CANCELLED';
}
