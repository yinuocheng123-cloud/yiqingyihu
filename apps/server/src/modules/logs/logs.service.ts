/**
 * 文件说明：操作日志服务。
 * 功能说明：提供后台查看关键操作日志的基础查询接口。
 *
 * 结构概览：
 *   第一部分：服务实现
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.operationLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }
}
