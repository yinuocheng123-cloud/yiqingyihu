/**
 * 文件说明：操作日志控制器。
 * 功能说明：提供日志列表读取接口，便于第一版先满足查看需求。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：控制器实现
 */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/enums/permission.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { LogsService } from './logs.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @Permissions(PermissionCode.LogView)
  findAll() {
    return this.logsService.findAll();
  }
}
