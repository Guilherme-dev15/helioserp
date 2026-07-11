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
      console.log(
        '🔄 Validando token diretamente com o servidor do Supabase...',
      );

      // Ligação direta com a API do seu Supabase para verificar a autenticidade
      const response = await fetch(
        'https://kdxvhxvnemmhswpuwgvg.supabase.co/auth/v1/user',
        {
          method: 'GET',
          headers: {
            Authorization: authHeader, // Envia o Bearer Token que veio do Thunder Client
            apikey: 'sb_publishable_Vsi18ypKnMe5ekj8PDJ-qQ_kE7dcOl0', // Sua chave pública
          },
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        console.error('🕵️ O SUPABASE RECUSOU O TOKEN:', errData);
        throw new UnauthorizedException('Token inválido ou expirado');
      }

      // Se passou, o token é 100% legítimo
      const user = await response.json();

      // Injeta os dados do utilizador (tenant) na rota
      request.user = { userId: user.id, email: user.email };

      console.log('✅ Token validado com sucesso! Acesso liberado.');
      return true;
    } catch (error) {
      console.error('🕵️ FALHA DE CONEXÃO COM O SUPABASE:', error);
      throw new UnauthorizedException('Falha interna de autenticação');
    }
  }
}
