/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 👇 ESTA É A LINHA QUE SALVA O SERVIDOR. Copie e cole exatamente assim:
      secretOrKey:
        process.env.JWT_SECRET || 'chave_de_emergencia_para_nao_crashar',
    });
  }

  validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
