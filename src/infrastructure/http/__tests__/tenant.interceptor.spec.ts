/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/infrastructure/http/__tests__/tenant.interceptor.spec.ts
import {
  ExecutionContext,
  UnauthorizedException,
  CallHandler,
} from '@nestjs/common';
import { TenantInterceptor } from '../tenant.interceptor';
import { TenantContext } from '../../database/tenant-context';
import { PrismaService } from '../../database/prisma.service';
import { of, lastValueFrom } from 'rxjs';

describe('TenantInterceptor v2 (JWT Auth)', () => {
  let interceptor: TenantInterceptor;
  let tenantContext: TenantContext;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(() => {
    tenantContext = new TenantContext();
    // Criamos um mock fake do Prisma apenas para o teste não bater no banco real
    prismaService = {
      user: {
        findUnique: jest.fn(),
      },
    } as any;
    interceptor = new TenantInterceptor(tenantContext, prismaService);
  });

  it('deve lançar UnauthorizedException se não houver usuário na requisição', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: null }), // Nenhum token JWT foi decodificado
      }),
    } as ExecutionContext;

    const mockCallHandler = { handle: () => of('next') } as CallHandler;

    // Testando o throw SÍNCRONO (sem await/lastValueFrom)
    expect(() => interceptor.intercept(mockContext, mockCallHandler)).toThrow(
      UnauthorizedException,
    );
  });

  it('deve extrair o tenant do banco e injetar no contexto se o usuário existir', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { userId: 'user-123' } }), // Mock do JwtAuthGuard
      }),
    } as ExecutionContext;

    const mockCallHandler = { handle: () => of('next') } as CallHandler;

    // Forçamos o Prisma a "achar" o tenantId 'adega-456'
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue({
      tenantId: 'adega-456',
    });
    const runSpy = jest.spyOn(tenantContext, 'runWithTenant');

    await lastValueFrom(interceptor.intercept(mockContext, mockCallHandler));

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      select: { tenantId: true },
    });
    expect(runSpy).toHaveBeenCalledWith('adega-456', expect.any(Function));
  });
});
