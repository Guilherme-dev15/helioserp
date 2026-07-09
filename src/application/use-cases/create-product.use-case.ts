// src/application/use-cases/create-product.use-case.ts
import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product';
import { ProductRepository } from '../../domain/repositories/product.repository';

export interface CreateProductCommand {
  tenantId: string;
  name: string;
  description?: string;
  price: number; // Em centavos
  minStockThreshold?: number;
}

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: CreateProductCommand): Promise<Product> {
    // 1. Cria a entidade no domínio puro (valida as regras de negócio)
    const product = Product.create({
      tenantId: command.tenantId,
      name: command.name,
      description: command.description,
      price: command.price,
      minStockThreshold: command.minStockThreshold,
    });

    // 2. Persiste a entidade usando a porta (interface) do repositório
    await this.productRepository.create(product);

    // 3. Retorna o produto criado para a Controller
    return product;
  }
}
