// src/infrastructure/auth/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

// Correção do 'any': Interface para tipar o payload do JWT do Supabase
interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  [key: string]: unknown; // Permite outras propriedades sem quebrar o tipo
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SUPABASE_JWT_SECRET as string,
    });
  }

  // O Passport já validou a assinatura do token neste ponto.
  // O payload contém os dados que o Supabase embutiu no JWT.
  // FIX: Removido 'async' porque não há operações assíncronas (promessas) aqui.
  validate(payload: SupabaseJwtPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    // Retornamos os dados mínimos para a requisição (o "sub" é o ID do usuário no Supabase)
    // Nosso Guard/Interceptor vai usar isso para buscar o tenant_id associado a este usuário.
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role || 'VENDEDOR',
    };
  }
}
