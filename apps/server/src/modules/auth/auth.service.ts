/**
 * 文件说明：认证服务。
 * 功能说明：处理账号密码登录、Google OAuth 回调换票据、本地用户映射和密码修改逻辑。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：公开认证接口
 *   第三部分：Google OAuth 处理
 *   第四部分：用户装配与辅助函数
 */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';

interface GoogleProfile {
  sub?: string;
  email?: string;
  name?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.findAuthUser(dto.username);

    if (!user || user.status !== 'ENABLED') {
      throw new UnauthorizedException('账号不存在或已停用');
    }

    const matched = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matched) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    return this.buildLoginResponse(user.id);
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

  getGoogleAuthUrl(origin?: string) {
    const clientId = this.getRequiredConfig('GOOGLE_CLIENT_ID');
    const callbackUrl = this.getRequiredConfig('GOOGLE_CALLBACK_URL');
    const frontendOrigin = this.normalizeFrontendOrigin(origin);
    const state = Buffer.from(JSON.stringify({ origin: frontendOrigin }), 'utf-8').toString('base64url');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleGoogleCallback(code: string | undefined, state: string | undefined) {
    if (!code) {
      throw new BadRequestException('缺少 Google 授权 code');
    }

    const clientId = this.getRequiredConfig('GOOGLE_CLIENT_ID');
    const clientSecret = this.getRequiredConfig('GOOGLE_CLIENT_SECRET');
    const callbackUrl = this.getRequiredConfig('GOOGLE_CALLBACK_URL');
    const frontendOrigin = this.parseStateOrigin(state);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new UnauthorizedException('Google 授权换取 access token 失败');
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
    };

    if (!tokenData.access_token) {
      throw new UnauthorizedException('Google 未返回 access token');
    }

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new UnauthorizedException('Google 用户信息获取失败');
    }

    const googleProfile = (await profileResponse.json()) as GoogleProfile;
    const user = await this.findOrCreateGoogleUser(googleProfile);
    const loginResponse = await this.buildLoginResponse(user.id);
    const encodedToken = encodeURIComponent(loginResponse.accessToken);
    const encodedUser = encodeURIComponent(JSON.stringify(loginResponse.user));

    return `${frontendOrigin}/auth/google/callback#accessToken=${encodedToken}&user=${encodedUser}`;
  }

  buildGoogleErrorRedirect(state?: string) {
    const frontendOrigin = this.parseStateOrigin(state);
    return `${frontendOrigin}/login?googleError=1`;
  }

  private async buildLoginResponse(userId: string) {
    const user = await this.findAuthUserById(userId);
    if (!user || user.status !== 'ENABLED') {
      throw new UnauthorizedException('用户不存在或已停用');
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

  private async findOrCreateGoogleUser(profile: GoogleProfile) {
    const username = profile.email?.toLowerCase() ?? (profile.sub ? `google_${profile.sub}` : undefined);
    if (!username || !profile.sub) {
      throw new UnauthorizedException('Google 返回的用户信息不完整');
    }

    const existing = await this.findAuthUser(username);
    if (existing) {
      if (existing.status !== 'ENABLED') {
        throw new UnauthorizedException('账号已停用');
      }

      await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          realName: profile.name || existing.realName,
        },
      });

      return existing;
    }

    const operatorRole = await this.prisma.role.findUnique({
      where: { code: 'OPERATOR' },
    });
    const passwordHash = await bcrypt.hash(`${profile.sub}:${Date.now()}`, 10);

    return this.prisma.user.create({
      data: {
        username,
        passwordHash,
        realName: profile.name || username,
        status: 'ENABLED',
        roles: operatorRole
          ? {
              create: [
                {
                  roleId: operatorRole.id,
                },
              ],
            }
          : undefined,
      },
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
  }

  private findAuthUser(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
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
  }

  private findAuthUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
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
  }

  private getRequiredConfig(key: string) {
    const value = process.env[key];
    if (!value) {
      throw new InternalServerErrorException(`${key} 未配置`);
    }
    return value;
  }

  private normalizeFrontendOrigin(origin?: string) {
    if (!origin) {
      return 'http://localhost:5173';
    }

    try {
      return new URL(origin).origin;
    } catch {
      return 'http://localhost:5173';
    }
  }

  private parseStateOrigin(state?: string) {
    if (!state) {
      return 'http://localhost:5173';
    }

    try {
      const decoded = Buffer.from(state, 'base64url').toString('utf-8');
      const payload = JSON.parse(decoded) as { origin?: string };
      return this.normalizeFrontendOrigin(payload.origin);
    } catch {
      return 'http://localhost:5173';
    }
  }
}
