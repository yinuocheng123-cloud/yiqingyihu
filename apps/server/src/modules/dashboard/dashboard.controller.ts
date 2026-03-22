/**
 * 文件说明：看板控制器。
 * 功能说明：提供首页概览与待办提醒接口。
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
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @Permissions(PermissionCode.DashboardView)
  getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('reminders')
  @Permissions(PermissionCode.DashboardView)
  getReminders() {
    return this.dashboardService.getReminders();
  }
}
