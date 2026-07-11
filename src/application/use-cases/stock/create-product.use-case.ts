// src/application/use-cases/stock/create-product.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { Product } from '../../../domain/entities/product';

export interface CreateProductInput {
  tenantId: string;
  name: string;
  price: number;
  stock: number;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(ProductRepository)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    if (!input.tenantId) {
      throw new Error('O produto deve pertencer a um tenant válido');
    }

    const product = Product.create({
      tenantId: input.tenantId,
      name: input.name,
      price: input.price,
      stock: input.stock,
    });

    await this.productRepository.create(product);

    return product;
  }
}
