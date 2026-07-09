// src/infrastructure/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Aqui podemos no futuro adicionar a lógica de ler rotas @Public()
  // para ignorar a autenticação no catálogo público.
}
