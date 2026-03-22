/**
 * 文件说明：Prisma 服务封装。
 * 功能说明：统一管理数据库连接生命周期，避免每个模块重复初始化客户端。
 *
 * 结构概览：
 *   第一部分：类定义
 *   第二部分：连接生命周期
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
