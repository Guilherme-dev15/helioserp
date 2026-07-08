import {
  ExecutionContext,
  BadRequestException,
  CallHandler,
} from '@nestjs/common';
import { TenantInterceptor } from '../tenant.interceptor';
import { TenantContext } from '../../database/tenant-context';
import { of } from 'rxjs';

describe('TenantInterceptor', () => {
  let interceptor: TenantInterceptor;
  let tenantContext: TenantContext;

  beforeEach(() => {
    tenantContext = new TenantContext();
    interceptor = new TenantInterceptor(tenantContext);
  });

  it('deve lançar BadRequestException se o header x-tenant-id não for enviado', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as ExecutionContext;

    const mockCallHandler = { handle: () => of('next') } as CallHandler;

    expect(() => interceptor.intercept(mockContext, mockCallHandler)).toThrow(
      BadRequestException,
    );
  });

  it('deve executar o contexto do tenant se o header for enviado', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { 'x-tenant-id': 'adega-123' } }),
      }),
    } as ExecutionContext;

    const mockCallHandler = { handle: () => of('next') } as CallHandler;

    // Espiona se o contexto foi acionado corretamente
    const runSpy = jest.spyOn(tenantContext, 'runWithTenant');

    interceptor.intercept(mockContext, mockCallHandler);

    expect(runSpy).toHaveBeenCalledWith('adega-123', expect.any(Function));
  });
});
