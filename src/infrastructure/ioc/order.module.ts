// src/infrastructure/ioc/orders.module.ts
import { Module } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { PrismaOrderRepository } from '../database/repositories/prisma-order.repository';
import { PrismaService } from '../database/prisma.service';
import { TenantContext } from '../database/tenant-context';
import { ProductsModule } from './products.module';
import { CheckoutUseCase } from '../../application/use-cases/checkout.use-case';
@Module({
  imports: [ProductsModule],
  providers: [
    PrismaService,
    TenantContext,
    {
      provide: OrderRepository,
      useClass: PrismaOrderRepository,
    },
    CheckoutUseCase,
  ],
  exports: [OrderRepository, CheckoutUseCase],
})
export class OrdersModule {}
