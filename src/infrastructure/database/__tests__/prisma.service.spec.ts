// src/infrastructure/database/__tests__/prisma.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { TenantContext } from '../tenant-context';

describe('PrismaService & TenantContext Integration', () => {
  let prismaService: PrismaService;
  let tenantContext: TenantContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, TenantContext],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    tenantContext = module.get<TenantContext>(TenantContext);
  });

  it('deve inicializar os serviços com sucesso através da injeção do NestJS', () => {
    expect(prismaService).toBeDefined();
    expect(tenantContext).toBeDefined();
  });
});
