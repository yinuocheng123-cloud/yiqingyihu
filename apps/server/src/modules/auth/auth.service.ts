/**
 * 文件说明：认证服务。
 * 功能说明：处理登录鉴权、token 签发和修改密码逻辑。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：服务实现
 */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== 'ENABLED') {
      throw new UnauthorizedException('账号不存在或已停用');
    }

    const matched = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matched) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const roleCodes = user.roles.map((item) => item.role.code);
    const permissions = Array.from(
      new Set(
        user.roles.flatMap((item) =>
          item.role.permissions.map((rolePermission) => rolePermission.permission.code),
        ),
      ),
    );

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      realName: user.realName,
      roleCodes,
      permissions,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        status: user.status,
        roleCodes,
        permissions,
      },
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const matched = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!matched) {
      throw new UnauthorizedException('原密码错误');
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { success: true };
  }
}
