/**
 * 文件说明：回访模块。
 * 功能说明：装配回访控制器和服务，承接订单后的售后与复购跟进。
 *
 * 结构概览：
 *   第一部分：模块定义
 */
import { Module } from '@nestjs/common';
import { FollowupsController } from './followups.controller';
import { FollowupsService } from './followups.service';

@Module({
  controllers: [FollowupsController],
  providers: [FollowupsService],
  exports: [FollowupsService],
})
export class FollowupsModule {}
