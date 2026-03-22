/**
 * 文件说明：系统设置模块。
 * 功能说明：装配基础配置项和日志查看接口。
 *
 * 结构概览：
 *   第一部分：模块定义
 */
import { Module } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [LogsModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
