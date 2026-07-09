// src/application/use-cases/deactivate-product.use-case.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';

@Injectable()
export class DeactivateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(tenantId: string, productId: string): Promise<void> {
    const product = await this.productRepository.findById(tenantId, productId);

    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }

    product.deactivate(); // Regra de domínio pura
    await this.productRepository.update(product); // Salva no banco
  }
}
