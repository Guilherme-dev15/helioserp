/* eslint-disable @typescript-eslint/no-unsafe-return */
// src/infrastructure/database/tenant-context.ts
// Responsabilidade: Rastrear e expor o Tenant ID da requisição atual usando AsyncLocalStorage
// Chamado por: TenantInterceptor / PrismaService

import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class TenantContext {
  private static readonly storage = new AsyncLocalStorage<string>();

  /**
   * Executa uma função dentro de um contexto isolado com o ID do Tenant definido.
   */
  public runWithTenant(tenantId: string, callback: () => any) {
    return TenantContext.storage.run(tenantId, callback);
  }

  /**
   * Retorna o ID do Tenant da requisição atual ou undefined se estiver fora de um contexto.
   */
  public getTenantId(): string | undefined {
    return TenantContext.storage.getStore();
  }
}
