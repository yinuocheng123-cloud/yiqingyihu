/**
 * 文件说明：角色控制器。
 * 功能说明：提供角色和权限读取接口。
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
import { RolesService } from './roles.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions(PermissionCode.RoleView)
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @Permissions(PermissionCode.RoleView)
  findPermissions() {
    return this.rolesService.findPermissions();
  }
}
