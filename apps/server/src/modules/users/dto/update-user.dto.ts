/**
 * 文件说明：更新用户 DTO。
 * 功能说明：支持后台按需编辑用户基础信息和角色绑定。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  realName?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsArray()
  roleIds?: string[];
}
