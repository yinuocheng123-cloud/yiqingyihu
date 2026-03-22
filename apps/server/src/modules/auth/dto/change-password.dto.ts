/**
 * 文件说明：修改密码 DTO。
 * 功能说明：校验旧密码和新密码的基础规则。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword!: string;

  @IsString()
  @MinLength(6)
  newPassword!: string;
}
