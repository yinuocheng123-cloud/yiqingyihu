/**
 * 文件说明：订单控制器。
 * 功能说明：提供订单列表、详情、新增和编辑接口，支撑客户到成交的业务主链路。
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
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Permissions(PermissionCode.OrderView)
  findAll(@Query('keyword') keyword?: string) {
    return this.ordersService.findAll(keyword);
  }

  @Get(':id')
  @Permissions(PermissionCode.OrderView)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @Permissions(PermissionCode.OrderCreate)
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: { id: string }) {
    return this.ordersService.create(dto, user.id);
  }

  @Patch(':id')
  @Permissions(PermissionCode.OrderEdit)
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }
}
