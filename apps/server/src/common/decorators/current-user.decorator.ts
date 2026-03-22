/**
 * 文件说明：当前登录用户装饰器。
 * 功能说明：从请求对象中提取 JWT 解析后的用户信息，减少控制器重复代码。
 *
 * 结构概览：
 *   第一部分：装饰器定义
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
