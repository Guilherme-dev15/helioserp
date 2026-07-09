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
  async incrementStock(
    tenantId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    await this.prisma.scoped(async (tx) => {
      const result = await tx.product.updateMany({
        where: { id: productId, tenantId },
        data: { stock: { increment: quantity } },
      });

      if (result.count === 0) {
        throw new Error('NOT_FOUND'); // Será capturado e traduzido pelo Use Case
      }
    });
  }

  async decrementStock(
    tenantId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    await this.prisma.scoped(async (tx) => {
      // 1. Verifica se o produto existe e pertence ao tenant
      const productExists = await tx.product.findUnique({
        where: { id: productId, tenantId },
        select: { id: true }, // Select mínimo para economizar I/O
      });

      if (!productExists) {
        throw new Error('NOT_FOUND');
      }

      // 2. Tenta o decremento com a trava gte
      const result = await tx.product.updateMany({
        where: {
          id: productId,
          tenantId,
          stock: { gte: quantity },
        },
        data: { stock: { decrement: quantity } },
      });

      if (result.count === 0) {
        throw new Error('INSUFFICIENT_STOCK');
      }
    });
  }
}
