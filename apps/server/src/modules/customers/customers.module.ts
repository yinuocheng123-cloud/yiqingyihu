/**
 * 文件说明：客户模块。
 * 功能说明：装配客户控制器和服务，作为第一批业务模块入口。
 *
 * 结构概览：
 *   第一部分：模块定义
 */
import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
