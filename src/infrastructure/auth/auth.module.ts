import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/jwt.strategy';
import { APP_INTERCEPTOR } from '@nestjs/core/constants';
import { TenantInterceptor } from '../http/tenant.interceptor';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [
    JwtStrategy,
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
  ],
  exports: [PassportModule],
})
export class AuthModule {}
