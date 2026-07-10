import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';

export interface UpdateProductImageCommand {
  tenantId: string;
  productId: string;
  imageUrl: string;
}

@Injectable()
export class UpdateProductImageUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: UpdateProductImageCommand): Promise<void> {
    const product = await this.productRepository.findById(
      command.tenantId,
      command.productId,
    );

    if (!product) {
      throw new NotFoundException('Produto não encontrado.');
    }

    product.updateImageUrl(command.imageUrl);
    await this.productRepository.update(product);
  }
}
