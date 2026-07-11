/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/infrastructure/repositories/prisma-product.repository.ts
// Responsabilidade: Implementar a interface ProductRepositoryPort usando o Prisma ORM

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service'; // Ajuste o caminho se necessário
import { ProductRepositoryPort } from '../../application/ports/product-repository.port';

@Injectable()
export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async save(product: any): Promise<void> {
    await this.prisma.product.create({
      data: {
        tenantId: product.tenantId,
        name: product.name,
        price: product.price,
        stock: product.stock,
      },
    });
  }
}
