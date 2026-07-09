// src/application/use-cases/update-product-image.use-case.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { Product } from '../../domain/entities/product';

export interface UpdateProductImageCommand {
  tenantId: string;
  productId: string;
  imageUrl: string;
}

@Injectable()
export class UpdateProductImageUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: UpdateProductImageCommand): Promise<Product> {
    const product = await this.productRepository.findById(
      command.tenantId,
      command.productId,
    );

    if (!product) {
      throw new NotFoundException(
        'Produto não encontrado ou não pertence a esta loja.',
      );
    }

    product.updateImageUrl(command.imageUrl); // Regra de domínio pura
    await this.productRepository.update(product);

    return product;
  }
}
