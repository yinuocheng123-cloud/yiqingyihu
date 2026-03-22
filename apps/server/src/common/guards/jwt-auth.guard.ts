/**
 * 文件说明：JWT 认证守卫。
 * 功能说明：包装 Passport JWT 守卫，统一用于受保护接口。
 *
 * 结构概览：
 *   第一部分：守卫定义
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
