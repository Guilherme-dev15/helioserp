// src/infrastructure/database/repositories/prisma-product.repository.ts
import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { Product } from '../../../domain/entities/product';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(product: Product): Promise<void> {
    // Usamos o .scoped para garantir que a transação rode blindada pelo RLS do banco
    await this.prisma.scoped(async (tx) => {
      await tx.product.create({
        data: {
          id: product.id,
          tenantId: product.tenantId,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          active: product.isActive,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        },
      });
    });
  }
}
