/**
 * 文件说明：权限装饰器。
 * 功能说明：为控制器方法声明需要的权限编码，便于守卫统一处理。
 *
 * 结构概览：
 *   第一部分：装饰器定义
 */
import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../guards/permissions.guard';

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
