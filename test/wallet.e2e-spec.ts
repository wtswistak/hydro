import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { cleanDatabase, createTestApp } from './helpers/test-setup';
import { PrismaService } from 'src/core/database/prisma/prisma.service';

describe('Wallet (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let prisma: PrismaService;

  const testUser = {
    email: 'wallet@test.com',
    password: 'Password123',
  };

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);

    // Register and login test user
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

  // ─── POST /wallet ─────────────────────────────────────────────────────────────

  describe('POST /wallet', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/wallet')
        .send({ blockchain: 'ethereum' })
        .expect(401);
    });

    it('should return 400 with missing blockchain', async () => {
      await request(app.getHttpServer())
        .post('/wallet')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect(400);
    });

    it('should return 404 when blockchain does not exist', async () => {
      await request(app.getHttpServer())
        .post('/wallet')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ blockchain: 'non-existent-blockchain' })
        .expect(404);
    });

    it('should create a wallet when blockchain exists in DB', async () => {
      // use first blockchain from DB
      const blockchain = await prisma.blockchain.findFirst();

      if (!blockchain) {
        console.warn(
          'Brak blockchain w bazie testowej — pomiń test tworzenia portfela. Uruchom seed na bazie testowej.',
        );
        return;
      }

      const res = await request(app.getHttpServer())
        .post('/wallet')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ blockchain: blockchain.name })
        .expect(201);

      expect(res.body).toMatchObject({
        address: expect.any(String),
        blockchainId: blockchain.id,
      });
      expect(res.body).not.toHaveProperty('privateKey');
    });
  });

  // ─── GET /wallet/all ──────────────────────────────────────────────────────────

  describe('GET /wallet/all', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/wallet/all').expect(401);
    });

    it('should return array of wallets (empty or not)', async () => {
      const res = await request(app.getHttpServer())
        .get('/wallet/all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return wallet with correct shape when wallets exist', async () => {
      const blockchain = await prisma.blockchain.findFirst();
      if (!blockchain) return;

      // Create wallet, then get list
      await request(app.getHttpServer())
        .post('/wallet')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ blockchain: blockchain.name });

      const res = await request(app.getHttpServer())
        .get('/wallet/all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.length).toBeGreaterThan(0);
      const wallet = res.body[0];
      expect(wallet).toHaveProperty('id');
      expect(wallet).toHaveProperty('address');
      expect(wallet).toHaveProperty('blockchain');
      expect(wallet).toHaveProperty('balances');
      expect(Array.isArray(wallet.balances)).toBe(true);
    });
  });
});
