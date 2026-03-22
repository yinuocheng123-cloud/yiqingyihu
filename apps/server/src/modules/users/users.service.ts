/**
 * 文件说明：用户服务。
 * 功能说明：提供用户查询、创建、更新和启停能力。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：服务实现
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(dto: CreateUserDto, operatorId?: string) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash,
        realName: dto.realName,
        mobile: dto.mobile,
        createdBy: operatorId,
        roles: {
          create: dto.roleIds.map((roleId) => ({
            roleId,
          })),
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('用户不存在');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.roleIds) {
        await tx.userRole.deleteMany({
          where: { userId: id },
        });
        await tx.userRole.createMany({
          data: dto.roleIds.map((roleId) => ({
            userId: id,
            roleId,
          })),
        });
      }

      return tx.user.update({
        where: { id },
        data: {
          realName: dto.realName,
          mobile: dto.mobile,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    });
  }

  async updateStatus(id: string, status: 'ENABLED' | 'DISABLED') {
    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }
}
