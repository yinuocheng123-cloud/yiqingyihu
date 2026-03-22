/**
 * 文件说明：回访控制器。
 * 功能说明：提供回访列表、详情、新增和编辑接口，支撑复购机会判断。
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/enums/permission.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateFollowupDto } from './dto/create-followup.dto';
import { UpdateFollowupDto } from './dto/update-followup.dto';
import { FollowupsService } from './followups.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('followups')
export class FollowupsController {
  constructor(private readonly followupsService: FollowupsService) {}

  @Get()
  @Permissions(PermissionCode.FollowupView)
  findAll(@Query('keyword') keyword?: string) {
    return this.followupsService.findAll(keyword);
  }

  @Get(':id')
  @Permissions(PermissionCode.FollowupView)
  findOne(@Param('id') id: string) {
    return this.followupsService.findOne(id);
  }

  @Post()
  @Permissions(PermissionCode.FollowupCreate)
  create(@Body() dto: CreateFollowupDto, @CurrentUser() user: { id: string }) {
    return this.followupsService.create(dto, user.id);
  }

  @Patch(':id')
  @Permissions(PermissionCode.FollowupEdit)
  update(@Param('id') id: string, @Body() dto: UpdateFollowupDto) {
    return this.followupsService.update(id, dto);
  }
}
