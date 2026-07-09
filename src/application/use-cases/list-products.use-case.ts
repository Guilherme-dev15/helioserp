// src/application/use-cases/list-products.use-case.ts
import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product';
import { ProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(tenantId: string): Promise<Product[]> {
    return this.productRepository.findAll(tenantId);
  }
}
