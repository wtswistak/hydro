import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { cleanDatabase, createTestApp } from './helpers/test-setup';
import { PrismaService } from 'src/core/database/prisma/prisma.service';

describe('Transaction (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let prisma: PrismaService;

  const testUser = {
    email: 'transaction@test.com',
    password: 'Password123',
  };

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    // Rejestracja i logowanie użytkownika testowego
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  // ─── POST /transaction ────────────────────────────────────────────────────────

  describe('POST /transaction', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/transaction')
        .send({
          receiverAddress: '0x123',
          amount: '0.01',
          cryptoSymbol: 'ETH',
          senderWalletId: 1,
        })
        .expect(401);
    });

    it('should return 400 when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/transaction')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });

    it('should return 400 when amount is not a number string', async () => {
      await request(app.getHttpServer())
        .post('/transaction')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          receiverAddress: '0xabc',
          amount: 'not-a-number',
          cryptoSymbol: 'ETH',
          senderWalletId: 1,
        })
        .expect(400);
    });

    it('should return 400 when senderWalletId is not a number', async () => {
      await request(app.getHttpServer())
        .post('/transaction')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          receiverAddress: '0xabc',
          amount: '1.0',
          cryptoSymbol: 'ETH',
          senderWalletId: 'not-a-number',
        })
        .expect(400);
    });

    it('should return 404 when wallet does not exist', async () => {
      await request(app.getHttpServer())
        .post('/transaction')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          receiverAddress: '0xabc123',
          amount: '0.001',
          cryptoSymbol: 'ETH',
          senderWalletId: 99999,
        })
        .expect(404);
    });
  });

  // ─── GET /transaction/fee/estimated ──────────────────────────────────────────

  describe('GET /transaction/fee/estimated', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/transaction/fee/estimated')
        .query({
          receiverAddress: '0x123',
          amount: '0.01',
          cryptoSymbol: 'ETH',
        })
        .expect(401);
    });

    it('should return 400 when required query params are missing', async () => {
      await request(app.getHttpServer())
        .get('/transaction/fee/estimated')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({})
        .expect(400);
    });

    it('should return 400 when amount is not a number string', async () => {
      await request(app.getHttpServer())
        .get('/transaction/fee/estimated')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({
          receiverAddress: '0xabc',
          amount: 'invalid',
          cryptoSymbol: 'ETH',
        })
        .expect(400);
    });

    it('should return 404 when cryptoSymbol does not exist in DB', async () => {
      await request(app.getHttpServer())
        .get('/transaction/fee/estimated')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({
          receiverAddress: '0xabc123',
          amount: '0.001',
          cryptoSymbol: 'NON_EXISTENT_SYMBOL',
        })
        .expect(404);
    });
  });
});
