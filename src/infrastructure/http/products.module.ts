import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
// Ajuste os caminhos abaixo conforme a sua estrutura de pastas real:
import { PrismaService } from '../database/prisma.service';
import { PrismaProductRepository } from '../repositories/prisma-product.repository';
import { CreateProductUseCase } from '../../application/use-cases/stock/create-product.use-case';

@Module({
  controllers: [ProductsController],
  providers: [
    PrismaService,
    // 1. Ensinamos quem é o Repositório Oficial
    {
      provide: 'ProductRepositoryPort',
      useClass: PrismaProductRepository,
    },
    // 2. Construímos o Caso de Uso injetando o Repositório nele
    {
      provide: CreateProductUseCase,
      useFactory: (repository: PrismaProductRepository) => {
        return new CreateProductUseCase(repository);
      },
      inject: ['ProductRepositoryPort'], // Injeta a dependência acima
    },
  ],
})
export class ProductsModule {}
