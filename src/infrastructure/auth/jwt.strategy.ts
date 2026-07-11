/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface SupabaseJwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    console.log('🚀 Iniciando API com JWT nativo (Sem bibliotecas externas)');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ['ES256', 'RS256'], // 👈 Autoriza a fechadura digital do Supabase
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        // Busca a chave pública oficial no seu Supabase
        fetch(
          'https://kdxvhxvnemmhswpuwgvg.supabase.co/auth/v1/.well-known/jwks.json',
        )
          .then((res) => res.json())
          .then((data) => {
            const jwk = data.keys[0];
            // Converte a chave da web para o formato que a nossa API entende nativamente
            const publicKey = crypto.createPublicKey({
              key: jwk,
              format: 'jwk',
            });
            const pem = publicKey.export({ type: 'spki', format: 'pem' });
            done(null, pem);
          })
          .catch((err) => {
            console.error('Erro ao buscar a chave no Supabase:', err);
            done(err, null);
          });
      },
    });
  }

  validate(payload: SupabaseJwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
