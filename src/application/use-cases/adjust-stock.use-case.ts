/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ProductRepository } from '../../domain/repositories/product.repository';

export interface AdjustStockCommand {
  tenantId: string;
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
}

@Injectable()
export class AdjustStockUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: AdjustStockCommand): Promise<void> {
    if (command.quantity <= 0) {
      throw new BadRequestException('A quantidade deve ser maior que zero.');
    }

    try {
      if (command.type === 'IN') {
        await this.productRepository.incrementStock(
          command.tenantId,
          command.productId,
          command.quantity,
        );
      } else {
        await this.productRepository.decrementStock(
          command.tenantId,
          command.productId,
          command.quantity,
        );
      }
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        throw new NotFoundException(
          'Produto não encontrado ou não pertence a esta loja.',
        );
      }
      if (error.message === 'INSUFFICIENT_STOCK') {
        throw new ConflictException(
          'Falha na baixa: Estoque insuficiente devido a concorrência ou falta de saldo.',
        );
      }
      throw error;
    }
  }
}
