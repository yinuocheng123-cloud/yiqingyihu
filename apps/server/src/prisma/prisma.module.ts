/**
 * 文件说明：Prisma 模块。
 * 功能说明：为全局提供数据库服务实例。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：模块导出
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
