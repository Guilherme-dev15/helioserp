/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      console.log('🕵️ BLOQUEIO: Requisição sem o header Authorization');
      throw new UnauthorizedException('Token não enviado');
    }

    try {
      // 👇 Esta é a frase que queremos ver no log!
      console.log(
        '🔄 Validando token diretamente com o servidor do Supabase...',
      );

      const response = await fetch(
        'https://kdxvhxvnemmhswpuwgvg.supabase.co/auth/v1/user',
        {
          method: 'GET',
          headers: {
            Authorization: authHeader,
            apikey: 'sb_publishable_Vsi18ypKnMe5ekj8PDJ-qQ_kE7dcOl0',
          },
        },
      );

      if (!response.ok) {
        console.error('🕵️ O SUPABASE RECUSOU O TOKEN.');
        throw new UnauthorizedException('Token inválido ou expirado');
      }

      const user = await response.json();

      request.user = { userId: user.id, email: user.email };

      console.log('✅ Token validado com sucesso! Acesso liberado.');
      return true;
    } catch (error) {
      console.error('🕵️ FALHA DE CONEXÃO:', error);
      throw new UnauthorizedException('Falha interna de autenticação');
    }
  }
}
