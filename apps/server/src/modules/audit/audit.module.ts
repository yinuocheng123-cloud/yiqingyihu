/**
 * 文件说明：操作日志公共模块。
 * 功能说明：导出统一日志服务，供各业务模块复用。
 *
 * 结构概览：
 *   第一部分：模块定义
 */
import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';

@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
