// src/infrastructure/ioc/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsController } from '../http/controllers/products.controller';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { PrismaProductRepository } from '../database/repositories/prisma-product.repository';
import { PrismaService } from '../database/prisma.service';
import { TenantContext } from '../database/tenant-context';
import { CatalogController } from '../http/controllers/catalog.controller';
import { ListPublicCatalogUseCase } from 'src/application/use-cases/list-public-catalog.use-case';

@Module({
  controllers: [ProductsController, CatalogController],
  providers: [
    CreateProductUseCase,
    PrismaService,
    TenantContext,
    ListPublicCatalogUseCase,
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository, // Injeção de dependência pura!
    },
  ],
  exports: [ProductRepository],
})
export class ProductsModule {}
