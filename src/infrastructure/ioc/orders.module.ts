import { Module } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repository';
import { PrismaOrderRepository } from '../database/repositories/prisma-order.repository';
import { PrismaService } from '../database/prisma.service';
import { TenantContext } from '../database/tenant-context';
import { CheckoutUseCase } from '../../application/use-cases/checkout.use-case';
import { ProductsModule } from './products.module';
import { OrdersController } from '../http/controllers/orders.controller';
// 👇 Importe o novo caso de uso
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';
import { TrackOrderUseCase } from 'src/application/use-cases/track-order.use-case';
import { GetDashboardMetricsUseCase } from 'src/application/use-cases/get-dashboard-metrics.use-case';

@Module({
  imports: [ProductsModule],
  controllers: [OrdersController],
  providers: [
    PrismaService,
    TenantContext,
    {
      provide: OrderRepository,
      useClass: PrismaOrderRepository,
    },
    CheckoutUseCase,
    UpdateOrderStatusUseCase,
    TrackOrderUseCase,
    GetDashboardMetricsUseCase,
  ],
  exports: [OrderRepository, CheckoutUseCase, UpdateOrderStatusUseCase],
})
export class OrdersModule {}
