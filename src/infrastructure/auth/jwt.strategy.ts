import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common'; // 👈 Removido o UnauthorizedException

// 💡 1. Tipagem forte do payload do Supabase para matar o 'any'
export interface SupabaseJwtPayload {
  sub: string;
  email: string;
  // O Supabase injeta mais coisas, mas por agora só precisamos destas
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const secret = process.env.SUPABASE_JWT_SECRET;

    if (!secret) {
      console.error('❌ ERRO CRÍTICO: SUPABASE_JWT_SECRET não definido!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret || 'chave-temporaria-para-deploy-2026',
    });
  }

  // 💡 2. Removido o 'async' (não usamos await aqui) e adicionada a interface
  validate(payload: SupabaseJwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
