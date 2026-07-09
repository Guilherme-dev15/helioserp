/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PrismaProductRepository } from '../repositories/prisma-product.repository';
import { TenantContext } from '../tenant-context';
import { randomUUID } from 'crypto';

describe('Controle de Concorrência de Estoque (Race Condition)', () => {
  let prisma: PrismaService;
  let repository: PrismaProductRepository;

  const tenantId = randomUUID();
  const productId = randomUUID();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, PrismaProductRepository, TenantContext],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    repository = module.get<PrismaProductRepository>(PrismaProductRepository);

    // Setup: Usa o Prisma para garantir que todas as colunas obrigatórias sejam preenchidas
    await prisma.tenant.create({
      data: {
        id: tenantId,
        name: 'Adega Test Concurrency',
        slug: `adega-test-${tenantId}`,
      },
    });

    await prisma.product.create({
      data: {
        id: productId,
        tenantId,
        name: 'Heineken 600ml - Concurrency Test',
        price: 1500,
        stock: 10,
      },
    });
  });

  afterAll(async () => {
    if (prisma) {
      // Teardown limpo e seguro
      await prisma.product.deleteMany({ where: { id: productId } });
      await prisma.tenant.delete({ where: { id: tenantId } });
      await prisma.$disconnect();
    }
  });

  it('deve impedir o overselling quando múltiplas requisições tentam esgotar o estoque simultaneamente', async () => {
    const requests = Array.from({ length: 15 }).map(() =>
      repository
        .decrementStock(tenantId, productId, 1)
        .then(() => 'SUCESSO')
        .catch((err) => err.message),
    );

    const results = await Promise.all(requests);

    const sucessos = results.filter((res) => res === 'SUCESSO').length;
    const falhas = results.filter((res) => res === 'INSUFFICIENT_STOCK').length;

    expect(sucessos).toBe(10);
    expect(falhas).toBe(5);

    const finalProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    expect(finalProduct?.stock).toBe(0);
  });
});
