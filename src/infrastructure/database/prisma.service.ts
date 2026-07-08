/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-call */
// src/infrastructure/database/prisma.service.ts
// Responsabilidade: Prover instância do Prisma garantindo isolamento RLS via transações PostgreSQL
// Chama: TenantContext | Chamado por: Repositories da camada de aplicação

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContext } from './tenant-context';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly tenantContext: TenantContext) {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Executa qualquer operação de banco garantindo que o RLS do Supabase esteja ativo para o tenant atual.
   * Obriga o uso de Interactive Transactions para evitar vazamento de conexões no Pool do Prisma.
   */
  public async scoped<T>(
    operation: (
      tx: Omit<
        PrismaClient,
        | '$connect'
        | '$disconnect'
        | '$on'
        | '$transaction'
        | '$use'
        | '$extends'
      >,
    ) => Promise<T>,
  ): Promise<T> {
    const tenantId = this.tenantContext.getTenantId();

    // Se não houver tenant no contexto (ex: um script CLI, cronjob global ou seed), executa normalmente sem travar o RLS
    if (!tenantId) {
      return operation(this);
    }

    // Força a execução dentro de uma transação isolada para garantir a mesma conexão física no Postgres
    return this.$transaction(
      async (
        tx: Omit<
          any,
          | '$connect'
          | '$disconnect'
          | '$on'
          | '$transaction'
          | '$use'
          | '$extends'
        >,
      ) => {
        // Injeta o UUID do tenant na sessão local da conexão atual
        await tx.$executeRawUnsafe(
          `SET LOCAL app.current_tenant_id = '${tenantId}';`,
        );

        try {
          return await operation(tx);
        } catch (error) {
          throw new InternalServerErrorException(
            'Falha de execução no escopo seguro do banco de dados.',
            { cause: error },
          );
        }
      },
    );
  }
}
