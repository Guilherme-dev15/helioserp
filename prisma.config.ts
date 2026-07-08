import 'dotenv/config';
import process from 'process';
import { defineConfig } from 'prisma/config';

// Validação simples para debugar no próprio terminal
const connectionString =
  process.env['DIRECT_URL'] || process.env['DATABASE_URL'];

if (!connectionString) {
  console.error('❌ ERRO: Nenhuma URL de banco encontrada no arquivo .env!');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: connectionString,
  },
});
