/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// __tests__/integration/auth.guard.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AuthGuard (Integração)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve retornar 401 Unauthorized ao acessar rota protegida sem token', () => {
    return request
      .default(app.getHttpServer())
      .post('/products') // Assumindo que a rota está protegida com @UseGuards(JwtAuthGuard)
      .send({ name: 'Produto Teste' })
      .expect(401);
  });
});
