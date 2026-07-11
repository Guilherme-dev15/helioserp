import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtStrategy } from '../auth/jwt.strategy';
import { TenantInterceptor } from '../http/tenant.interceptor';
import { TenantContext } from '../database/tenant-context';
import { PrismaService } from '../database/prisma.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [
    JwtStrategy,
    TenantContext,
    PrismaService,
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
  ],
  exports: [PassportModule, TenantContext],
})
export class AuthModule {}
