import { Module } from '@nestjs/common';
import { ProductsController } from '../http/controllers/products.controller';
import { PrismaService } from '../database/prisma.service';
import { TenantContext } from '../database/tenant-context';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { PrismaProductRepository } from '../database/repositories/prisma-product.repository';

// 👇 Importação de todos os Casos de Uso
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { DeactivateProductUseCase } from '../../application/use-cases/deactivate-product.use-case';
import { AdjustStockUseCase } from '../../application/use-cases/adjust-stock.use-case';
import { UpdateProductImageUseCase } from '../../application/use-cases/update-product-image.use-case';

@Module({
  controllers: [ProductsController],
  providers: [
    PrismaService,
    TenantContext,
    {
      provide: ProductRepository,
      useClass: PrismaProductRepository,
    },
    // 👇 Todos os Casos de Uso registados aqui!
    CreateProductUseCase,
    ListProductsUseCase,
    DeactivateProductUseCase,
    AdjustStockUseCase,
    UpdateProductImageUseCase,
  ],
  exports: [ProductRepository],
})
export class ProductsModule {}
