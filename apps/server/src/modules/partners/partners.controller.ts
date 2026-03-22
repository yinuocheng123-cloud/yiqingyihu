/**
 * 文件说明：伙伴控制器。
 * 功能说明：提供伙伴列表、新增和编辑接口。
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
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnersService } from './partners.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @Permissions(PermissionCode.PartnerView)
  findAll(@Query('keyword') keyword?: string) {
    return this.partnersService.findAll(keyword);
  }

  @Post()
  @Permissions(PermissionCode.PartnerCreate)
  create(@Body() dto: CreatePartnerDto, @CurrentUser() user: { id: string }) {
    return this.partnersService.create(dto, user.id);
  }

  @Patch(':id')
  @Permissions(PermissionCode.PartnerEdit)
  update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return this.partnersService.update(id, dto);
  }
}
