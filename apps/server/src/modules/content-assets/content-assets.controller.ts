/**
 * 文件说明：内容素材控制器。
 * 功能说明：提供素材列表、新增和编辑接口。
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
import { ContentAssetsService } from './content-assets.service';
import { CreateContentAssetDto } from './dto/create-content-asset.dto';
import { UpdateContentAssetDto } from './dto/update-content-asset.dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('content-assets')
export class ContentAssetsController {
  constructor(private readonly contentAssetsService: ContentAssetsService) {}

  @Get()
  @Permissions(PermissionCode.ContentAssetView)
  findAll(@Query('keyword') keyword?: string) {
    return this.contentAssetsService.findAll(keyword);
  }

  @Post()
  @Permissions(PermissionCode.ContentAssetCreate)
  create(@Body() dto: CreateContentAssetDto, @CurrentUser() user: { id: string }) {
    return this.contentAssetsService.create(dto, user.id);
  }

  @Patch(':id')
  @Permissions(PermissionCode.ContentAssetEdit)
  update(@Param('id') id: string, @Body() dto: UpdateContentAssetDto) {
    return this.contentAssetsService.update(id, dto);
  }
}
