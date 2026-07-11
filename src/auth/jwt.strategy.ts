/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
// src/infrastructure/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    // Falhar rápido: Se a chave do Supabase não estiver no .env, o servidor não deve subir.
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
      throw new Error('FATAL: SUPABASE_JWT_SECRET não configurado.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // O Supabase JWT tem um formato específico. O ID do usuário vem no 'sub'.
  // O app_metadata e user_metadata contêm as roles e informações do tenant.
  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException(
        'Token inválido ou sem identificação de usuário',
      );
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.app_metadata?.role || 'user',
      // No futuro, extrairemos o tenantId do app_metadata do Supabase aqui
    };
  }
}
