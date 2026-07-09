// src/infrastructure/ioc/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsController } from '../http/controllers/products.controller';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { PrismaProductRepository } from '../database/repositories/prisma-product.repository';
import { PrismaService } from '../database/prisma.service';
import { TenantContext } from '../database/tenant-context';

@Module({
  controllers: [ProductsController],
  providers: [
    CreateProductUseCase,
    PrismaService,
    TenantContext,
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository, // Injeção de dependência pura!
    },
  ],
})
export class ProductsModule {}
