// src/app.module.ts
import { Module } from '@nestjs/common';
import { ProductsModule } from './infrastructure/ioc/products.module';
import { OrdersModule } from './infrastructure/ioc/orders.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModuleOptions } from '@nestjs/passport';
@Module({
  imports: [
    // 👇 Configura o limite: Máximo de 100 requisições a cada 60 segundos (60000 ms) por IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModuleOptions,
    ProductsModule,
    OrdersModule,
  ],
  providers: [
    // 👇 Ativa o guarda em TODAS as rotas da API automaticamente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
