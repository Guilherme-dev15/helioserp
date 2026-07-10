// src/app.module.ts
import { Module } from '@nestjs/common';
import { ProductsModule } from './infrastructure/ioc/products.module';
import { OrdersModule } from './infrastructure/ioc/orders.module';
@Module({
  imports: [
    ProductsModule,
    OrdersModule,
    // Futuramente colocaremos o AuthModule e outros aqui
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
