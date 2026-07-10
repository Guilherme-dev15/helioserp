import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { Prisma } from '@prisma/client';

export interface PublicProductDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

export interface PublicCatalogResponse {
  tenantName: string;
  products: PublicProductDTO[];
}

@Injectable()
export class ListPublicCatalogUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    tenantSlug: string,
    searchTerm?: string,
  ): Promise<PublicCatalogResponse> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      throw new NotFoundException('Catálogo não encontrado.');
    }

    const whereClause: Prisma.ProductWhereInput = {
      tenantId: tenant.id,
      active: true,
    };

    if (searchTerm) {
      whereClause.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const products = await this.prisma.product.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    return {
      tenantName: tenant.name,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        isAvailable: p.stock > 0,
      })),
    };
  }
}
