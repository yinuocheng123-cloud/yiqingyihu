/**
 * 文件说明：看板模块。
 * 功能说明：装配首页概览和提醒能力。
 *
 * 结构概览：
 *   第一部分：模块定义
 */
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
