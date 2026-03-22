/**
 * 文件说明：客户控制器。
 * 功能说明：提供客户列表、详情、新增和编辑接口，支撑客户管理首轮业务闭环。
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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Permissions(PermissionCode.CustomerView)
  findAll(@Query('keyword') keyword?: string) {
    return this.customersService.findAll(keyword);
  }

  @Get(':id')
  @Permissions(PermissionCode.CustomerView)
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @Permissions(PermissionCode.CustomerCreate)
  create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.customersService.create(dto, user.id);
  }

  @Patch(':id')
  @Permissions(PermissionCode.CustomerEdit)
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }
}
