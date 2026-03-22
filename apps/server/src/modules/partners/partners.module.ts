/**
 * 文件说明：伙伴模块。
 * 功能说明：装配伙伴控制器和服务，承接代理/分销意向沉淀。
 *
 * 结构概览：
 *   第一部分：模块定义
 */
import { Module } from '@nestjs/common';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';

@Module({
  controllers: [PartnersController],
  providers: [PartnersService],
})
export class PartnersModule {}
