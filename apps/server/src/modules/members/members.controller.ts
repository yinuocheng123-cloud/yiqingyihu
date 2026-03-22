/**
 * 文件说明：会员控制器。
 * 功能说明：提供会员列表、详情、新增和编辑接口。
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
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersService } from './members.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @Permissions(PermissionCode.MemberView)
  findAll(@Query('keyword') keyword?: string) {
    return this.membersService.findAll(keyword);
  }

  @Get(':id')
  @Permissions(PermissionCode.MemberView)
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Post()
  @Permissions(PermissionCode.MemberCreate)
  create(@Body() dto: CreateMemberDto, @CurrentUser() user: { id: string }) {
    return this.membersService.create(dto, user.id);
  }

  @Patch(':id')
  @Permissions(PermissionCode.MemberEdit)
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }
}
