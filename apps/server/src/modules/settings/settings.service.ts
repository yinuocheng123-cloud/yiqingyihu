/**
 * 文件说明：系统设置服务。
 * 功能说明：提供基础配置项查询、新增和编辑能力。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：服务实现
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  findAll(configType?: string) {
    return this.prisma.systemConfig.findMany({
      where: configType ? { configType } : undefined,
      orderBy: [
        { configType: 'asc' },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  async create(dto: CreateSystemConfigDto) {
    const config = await this.prisma.systemConfig.create({
      data: {
        configType: dto.configType,
        configKey: dto.configKey,
        configValue: {
          label: dto.label,
          value: dto.value ?? dto.configKey,
        },
        status: dto.status === 'DISABLED' ? 'DISABLED' : 'ENABLED',
        remarks: dto.remarks,
      },
    });

    await this.auditService.log({
      module: 'settings',
      bizType: 'system_config',
      bizId: config.id,
      action: 'create',
      changeSummary: '新增系统配置项',
      afterData: config,
    });

    return config;
  }

  async update(id: string, dto: UpdateSystemConfigDto) {
    const existing = await this.prisma.systemConfig.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('配置项不存在');
    }

    const currentValue = existing.configValue as { label?: string; value?: string };

    const config = await this.prisma.systemConfig.update({
      where: { id },
      data: {
        configType: dto.configType,
        configKey: dto.configKey,
        configValue: {
          label: dto.label ?? currentValue?.label ?? dto.configKey,
          value: dto.value ?? currentValue?.value ?? dto.configKey,
        },
        status: dto.status === 'DISABLED' ? 'DISABLED' : dto.status ? 'ENABLED' : undefined,
        remarks: dto.remarks,
      },
    });

    await this.auditService.log({
      module: 'settings',
      bizType: 'system_config',
      bizId: config.id,
      action: 'update',
      changeSummary: '编辑系统配置项',
      beforeData: existing,
      afterData: config,
    });

    return config;
  }
}
