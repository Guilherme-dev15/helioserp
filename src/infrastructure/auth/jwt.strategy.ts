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
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 👇 O pulo do gato: Lê a chave pública (ES256/RS256) direto do seu Supabase
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
