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
  async findAll(tenantId: string): Promise<Product[]> {
    return this.prisma.scoped(async (tx) => {
      const models = await tx.product.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
      });

      return models.map((model) => Product.restore(model));
    });
  }

  async findById(tenantId: string, productId: string): Promise<Product | null> {
    return this.prisma.scoped(async (tx) => {
      const model = await tx.product.findUnique({
        where: { id: productId, tenantId },
      });

      if (!model) return null;
      return Product.restore(model);
    });
  }

  async update(product: Product): Promise<void> {
    await this.prisma.scoped(async (tx) => {
      await tx.product.update({
        where: { id: product.id },
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          active: product.isActive,
          updatedAt: product.updatedAt,
        },
      });
    });
  }
}
