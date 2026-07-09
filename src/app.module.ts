// src/app.module.ts
import { Module } from '@nestjs/common';
import { ProductsModule } from './infrastructure/ioc/products.module';

@Module({
  imports: [
    ProductsModule,
    // Futuramente colocaremos o AuthModule e outros aqui
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
