/**
 * 文件说明：认证控制器。
 * 功能说明：提供账号密码登录、Google OAuth 登录、当前用户信息和修改密码接口。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：控制器实现
 */
import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('google')
  googleLogin(@Query('origin') origin: string | undefined, @Res() res: Response) {
    return res.redirect(this.authService.getGoogleAuthUrl(origin));
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ) {
    try {
      const redirectUrl = await this.authService.handleGoogleCallback(code, state);
      return res.redirect(redirectUrl);
    } catch (_error) {
      return res.redirect(this.authService.buildGoogleErrorRedirect(state));
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@CurrentUser() user: Record<string, unknown>) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@CurrentUser() user: { id: string }, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.id, dto);
  }
}
