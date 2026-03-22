/**
 * 文件说明：操作日志服务。
 * 功能说明：为各业务模块提供统一的日志写入能力，避免每个模块重复拼装日志结构。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：类型定义
 *   第三部分：服务实现
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface AuditPayload {
  module: string;
  bizType: string;
  bizId: string;
  action: string;
  changeSummary?: string;
  beforeData?: unknown;
  afterData?: unknown;
  operatorId?: string;
  operatorName?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(payload: AuditPayload) {
    await this.prisma.operationLog.create({
      data: {
        module: payload.module,
        bizType: payload.bizType,
        bizId: payload.bizId,
        action: payload.action,
        changeSummary: payload.changeSummary,
        beforeData: payload.beforeData as object | undefined,
        afterData: payload.afterData as object | undefined,
        operatorId: payload.operatorId,
        operatorName: payload.operatorName,
      },
    });
  }
}
