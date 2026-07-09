/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/infrastructure/http/tenant.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable, from, switchMap } from 'rxjs';
import { TenantContext } from '../database/tenant-context';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(
    private readonly tenantContext: TenantContext,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // 1. O usuário foi injetado pelo JwtAuthGuard (Passport)?
    const user = request.user;

    if (!user || !user.userId) {
      throw new UnauthorizedException(
        'Usuário não autenticado ou token inválido.',
      );
    }

    // 2. Buscamos no banco a qual Tenant este usuário pertence.
    // Usamos o RxJS (from) para não quebrar a esteira de observables do NestJS.
    return from(
      this.prisma.user.findUnique({
        where: { id: user.userId },
        select: { tenantId: true },
      }),
    ).pipe(
      switchMap((dbUser) => {
        if (!dbUser || !dbUser.tenantId) {
          throw new UnauthorizedException(
            'Usuário não possui vínculo ativo com nenhuma loja.',
          );
        }

        // 3. Sucesso absoluto. Envelopamos o resto da requisição no contexto deste Tenant.
        return this.tenantContext.runWithTenant(dbUser.tenantId, () => {
          return next.handle();
        });
      }),
    );
  }
}
