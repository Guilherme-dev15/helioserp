/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // 👇 O Soro da Verdade: Imprime no console do Render o motivo real do bloqueio
    if (info) {
      console.error('🕵️ MOTIVO SECRETO DO BLOQUEIO:', info.message || info);
    }
    if (err) {
      console.error('🕵️ ERRO INTERNO DO PASSPORT:', err);
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
