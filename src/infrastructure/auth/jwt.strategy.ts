import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { passportJwtSecret } from 'jwks-rsa';

export interface SupabaseJwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    console.log('🛡️ Iniciando JwtStrategy com suporte a ES256 (JWKS)...');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['ES256', 'RS256'], // 👈 Autorização explícita para o novo formato
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri:
          'https://kdxvhxvnemmhswpuwgvg.supabase.co/auth/v1/.well-known/jwks.json',
      }),
    });
  }

  validate(payload: SupabaseJwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
