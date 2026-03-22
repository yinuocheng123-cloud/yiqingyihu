/**
 * 文件说明：发货控制器。
 * 功能说明：提供发货记录列表、新增和编辑接口。
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
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { ShipmentsService } from './shipments.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get()
  @Permissions(PermissionCode.ShipmentView)
  findAll(@Query('keyword') keyword?: string) {
    return this.shipmentsService.findAll(keyword);
  }

  @Post()
  @Permissions(PermissionCode.ShipmentCreate)
  create(@Body() dto: CreateShipmentDto, @CurrentUser() user: { id: string }) {
    return this.shipmentsService.create(dto, user.id);
  }

  @Patch(':id')
  @Permissions(PermissionCode.ShipmentEdit)
  update(@Param('id') id: string, @Body() dto: UpdateShipmentDto) {
    return this.shipmentsService.update(id, dto);
  }
}
