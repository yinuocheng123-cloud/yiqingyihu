/**
 * 文件说明：用户控制器。
 * 功能说明：提供用户管理相关接口，作为权限系统的基础后台能力。
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
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/enums/permission.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions(PermissionCode.UserView)
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Permissions(PermissionCode.UserCreate)
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.usersService.create(dto, user.id);
  }

  @Patch(':id')
  @Permissions(PermissionCode.UserEdit)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/status')
  @Permissions(PermissionCode.UserEdit)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ENABLED' | 'DISABLED' },
  ) {
    return this.usersService.updateStatus(id, body.status);
  }
}
