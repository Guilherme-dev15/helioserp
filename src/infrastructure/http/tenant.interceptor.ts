/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/infrastructure/http/tenant.interceptor.ts
// Responsabilidade: Extrair o Tenant ID do Header HTTP e envelopar o contexto de execução
// Chama: TenantContext | Chamado por: Ciclo de vida global do NestJS

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from '../database/tenant-context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] as string;

    // Se a rota for pública (ex: webhook externo), o ideal é usar um Decorator customizado (@Public)
    // Para o nosso Day 1 de MVP, vamos exigir em tudo que passa pela API para garantir segurança máxima.
    if (!tenantId) {
      throw new BadRequestException(
        'O cabeçalho x-tenant-id é obrigatório para acessar este recurso.',
      );
    }

    // Injeta o ID da requisição atual no nosso AsyncLocalStorage
    return this.tenantContext.runWithTenant(tenantId, () => {
      // Toda execução a partir daqui (Controllers, Services, Prisma) enxerga este tenantId
      return next.handle();
    });
  }
}
