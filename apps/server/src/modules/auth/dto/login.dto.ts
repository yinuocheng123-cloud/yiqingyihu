/**
 * 文件说明：登录请求 DTO。
 * 功能说明：约束登录接口的用户名和密码输入。
 *
 * 结构概览：
 *   第一部分：字段定义
 */
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
