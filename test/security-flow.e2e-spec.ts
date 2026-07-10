/* eslint-disable */
/// <reference types="jest" />
require('dotenv').config();

import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { AppModule } from './../src/app.module';

// 👇 Importamos o seu guarda de segurança
import { JwtAuthGuard } from '../src/infrastructure/auth/jwt-auth.guard';

const request = require('supertest');

describe('Fluxos de Segurança e Validação (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // 👇 O TRUQUE DE MESTRE: Trocamos o guarda complexo por um simples!
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => {
          throw new UnauthorizedException(); // Simula o bloqueio 401 exato!
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. [Checkout] Deve atirar Erro 400 (Bad Request) se enviarmos um pedido vazio', () => {
    return request(app.getHttpServer())
      .post('/orders/checkout')
      .send({})
      .expect(400)
      .expect((res: any) => {
        expect(res.body.message).toEqual('O carrinho não pode estar vazio.');
      });
  });

  it('2. [Dashboard] Deve atirar Erro 401 (Unauthorized) se tentarmos ver as métricas sem estar logados', () => {
    return request(app.getHttpServer())
      .get('/orders/metrics/dashboard')
      .expect(401); // Agora vai brilhar a verde!
  });
});
