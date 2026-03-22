/**
 * 文件说明：内容素材服务。
 * 功能说明：提供素材列表、创建和编辑能力，为内容沉淀提供结构化入口。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：服务实现
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateContentAssetDto } from './dto/create-content-asset.dto';
import { UpdateContentAssetDto } from './dto/update-content-asset.dto';

@Injectable()
export class ContentAssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  findAll(keyword?: string) {
    const where: Prisma.ContentAssetWhereInput | undefined = keyword
      ? {
          OR: [
            { assetNo: { contains: keyword, mode: 'insensitive' } },
            { painPoint: { contains: keyword, mode: 'insensitive' } },
            { customerQuote: { contains: keyword, mode: 'insensitive' } },
            { titleHook: { contains: keyword, mode: 'insensitive' } },
          ],
        }
      : undefined;

    return this.prisma.contentAsset.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: {
        assetDate: 'desc',
      },
    });
  }

  async create(dto: CreateContentAssetDto, operatorId?: string) {
    const asset = await this.prisma.contentAsset.create({
      data: {
        assetNo: this.generateAssetNo(),
        assetDate: dto.assetDate ? new Date(dto.assetDate) : new Date(),
        sourceType: dto.sourceType,
        productId: dto.productId,
        customerType: dto.customerType,
        painPoint: dto.painPoint,
        customerQuote: dto.customerQuote,
        usageScenario: dto.usageScenario,
        feedbackResult: dto.feedbackResult,
        contentAngle: dto.contentAngle,
        titleHook: dto.titleHook,
        targetPlatform: dto.targetPlatform,
        contentFormat: dto.contentFormat,
        isPublished: dto.isPublished ?? false,
        publishUrl: dto.publishUrl,
        remarks: dto.remarks,
        createdBy: operatorId,
      },
      include: {
        product: true,
      },
    });

    await this.auditService.log({
      module: 'content-assets',
      bizType: 'content_asset',
      bizId: asset.id,
      action: 'create',
      changeSummary: '新增内容素材',
      afterData: asset,
      operatorId,
    });

    return asset;
  }

  async update(id: string, dto: UpdateContentAssetDto) {
    const existing = await this.prisma.contentAsset.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('内容素材不存在');
    }

    const asset = await this.prisma.contentAsset.update({
      where: { id },
      data: {
        assetDate: dto.assetDate ? new Date(dto.assetDate) : undefined,
        sourceType: dto.sourceType,
        productId: dto.productId,
        customerType: dto.customerType,
        painPoint: dto.painPoint,
        customerQuote: dto.customerQuote,
        usageScenario: dto.usageScenario,
        feedbackResult: dto.feedbackResult,
        contentAngle: dto.contentAngle,
        titleHook: dto.titleHook,
        targetPlatform: dto.targetPlatform,
        contentFormat: dto.contentFormat,
        isPublished: dto.isPublished,
        publishUrl: dto.publishUrl,
        remarks: dto.remarks,
      },
      include: {
        product: true,
      },
    });

    await this.auditService.log({
      module: 'content-assets',
      bizType: 'content_asset',
      bizId: asset.id,
      action: 'update',
      changeSummary: '编辑内容素材',
      beforeData: existing,
      afterData: asset,
    });

    return asset;
  }

  private generateAssetNo() {
    return `A${Date.now()}`;
  }
}
