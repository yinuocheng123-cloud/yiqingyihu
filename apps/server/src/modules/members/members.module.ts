/**
 * 文件说明：会员模块。
 * 功能说明：装配会员控制器和服务，承接客户到会员的转化。
 *
 * 结构概览：
 *   第一部分：模块定义
 */
import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
