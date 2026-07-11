import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

export interface SupabaseJwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    const secret = process.env.SUPABASE_JWT_SECRET;

    // 👇 A Prova de Fogo: Vai imprimir no log do Render se leu a chave
    console.log('🔑 Iniciando JwtStrategy...');
    console.log(
      `Tamanho do Secret lido: ${secret ? secret.length : 'UNDEFINED (FALHA GRAVE)'}`,
    );

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret || 'chave-fallback',
      algorithms: ['HS256'], // 👈 Dizemos explicitamente ao Passport para usar o clássico
    });
  }

  validate(payload: SupabaseJwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
