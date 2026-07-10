// src/infrastructure/ioc/orders.module.ts
import { Module } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { PrismaOrderRepository } from '../database/repositories/prisma-order.repository';
import { PrismaService } from '../database/prisma.service';
import { TenantContext } from '../database/tenant-context';

@Module({
  imports: [],
  providers: [
    PrismaService,
    TenantContext,
    {
      provide: OrderRepository,
      useClass: PrismaOrderRepository,
    },
  ],
  exports: [OrderRepository],
})
export class OrdersModule {}
