/**
 * 文件说明：JWT 策略。
 * 功能说明：负责解析并校验 token，有意只返回接口层真正需要的最小用户信息。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：策略实现
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret'),
    });
  }

  validate(payload: {
    sub: string;
    username: string;
    realName: string;
    roleCodes: string[];
    permissions: string[];
  }) {
    return {
      id: payload.sub,
      username: payload.username,
      realName: payload.realName,
      roleCodes: payload.roleCodes,
      permissions: payload.permissions,
    };
  }
}
