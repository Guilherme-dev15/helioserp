import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface PublicProductDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean; // True se tiver estoque > 0
}

export interface PublicCatalogResponse {
  tenantName: string;
  products: PublicProductDTO[];
}

@Injectable()
export class ListPublicCatalogUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(tenantSlug: string): Promise<PublicCatalogResponse> {
    // 1. Busca o Tenant pelo Slug (nome na URL)
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      throw new NotFoundException('Catálogo não encontrado.');
    }

    // 2. Busca apenas produtos ATIVOS dessa loja
    const products = await this.prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        active: true,
      },
      orderBy: { name: 'asc' },
    });

    // 3. Mapeia para não vazar dados sensíveis (como estoque exato ou limite mínimo)
    return {
      tenantName: tenant.name,
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        imageUrl: p.imageUrl,
        isAvailable: p.stock > 0, // Regra: Só está disponível se tiver estoque real
      })),
    };
  }
}
