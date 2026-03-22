/**
 * 文件说明：新增用户 DTO。
 * 功能说明：约束后台创建用户时的必填字段。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  realName!: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsArray()
  roleIds!: string[];
}
