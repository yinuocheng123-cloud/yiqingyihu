/**
 * 文件说明：系统设置控制器。
 * 功能说明：提供配置项和日志查看接口。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：控制器实现
 */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/enums/permission.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { LogsService } from '../logs/logs.service';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { SettingsService } from './settings.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly logsService: LogsService,
  ) {}

  @Get('configs')
  @Permissions(PermissionCode.SettingsView)
  findConfigs(@Query('configType') configType?: string) {
    return this.settingsService.findAll(configType);
  }

  @Post('configs')
  @Permissions(PermissionCode.SettingsEdit)
  createConfig(@Body() dto: CreateSystemConfigDto) {
    return this.settingsService.create(dto);
  }

  @Patch('configs/:id')
  @Permissions(PermissionCode.SettingsEdit)
  updateConfig(@Param('id') id: string, @Body() dto: UpdateSystemConfigDto) {
    return this.settingsService.update(id, dto);
  }

  @Get('logs')
  @Permissions(PermissionCode.LogView)
  findLogs() {
    return this.logsService.findAll();
  }
}
