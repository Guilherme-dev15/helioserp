import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'; // Importe a estratégia aqui!

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }), // Define o padrão
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'chave_de_emergencia_para_nao_crashar',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // A estratégia deve ser um provider aqui
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
