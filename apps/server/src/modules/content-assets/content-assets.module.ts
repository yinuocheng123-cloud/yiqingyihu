/**
 * 文件说明：内容素材模块。
 * 功能说明：装配素材控制器和服务，承接内容沉淀。
 *
 * 结构概览：
 *   第一部分：模块定义
 */
import { Module } from '@nestjs/common';
import { ContentAssetsController } from './content-assets.controller';
import { ContentAssetsService } from './content-assets.service';

@Module({
  controllers: [ContentAssetsController],
  providers: [ContentAssetsService],
})
export class ContentAssetsModule {}
