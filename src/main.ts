/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa a validação automática dos nossos DTOs globalmente
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Habilita o CORS para o Front-end conseguir fazer requisições
  app.enableCors();

  // 👇 CONFIGURAÇÃO DO SWAGGER (DOCUMENTAÇÃO DA API)
  const config = new DocumentBuilder()
    .setTitle('Helios ERP API')
    .setDescription(
      'Motor de Vendas, Estoque e Catálogo Multi-tenant para adegas.',
    )
    .setVersion('1.0')
    .addBearerAuth() // Adiciona o botão de "Authorize" para testarmos rotas com JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // A documentação ficará acessível na rota /api/docs
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`🚀 Helios ERP API rodando em: http://localhost:3000`);
  console.log(
    `📚 Documentação Swagger disponível em: http://localhost:3000/api/docs`,
  );
}
bootstrap();
