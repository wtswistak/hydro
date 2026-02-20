import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { cleanDatabase, createTestApp } from './helpers/test-setup';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const testUser = {
    email: 'e2e-auth@test.com',
    password: 'Password123',
  };

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  // ─── Register ────────────────────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('should register a new user and return 201', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(res.body).toMatchObject({ email: testUser.email });
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 409 when email already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should return 400 when email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'Password123' })
        .expect(400);
    });

    it('should return 400 when password is too weak', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'other@test.com', password: '123' })
        .expect(400);
    });
  });

  // ─── Login ───────────────────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('should login and return accessToken + refresh cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
      const rawCookie = res.headers['set-cookie'];
      const cookies: string[] = Array.isArray(rawCookie)
        ? rawCookie
        : [rawCookie ?? ''];
      expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
    });

    it('should return 401 with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword1' })
        .expect(401);
    });

    it('should return 401 with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@test.com', password: 'Password123' })
        .expect(401);
    });
  });

  // ─── Me ──────────────────────────────────────────────────────────────────────

  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser);
      accessToken = res.body.accessToken;
    });

    it('should return current user data', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({ email: testUser.email });
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  // ─── Refresh Token ───────────────────────────────────────────────────────────

  describe('POST /auth/refresh', () => {
    let refreshCookie: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser);
      const rawCookie = res.headers['set-cookie'];
      refreshCookie = Array.isArray(rawCookie)
        ? rawCookie.find((c) => c.startsWith('refreshToken='))
        : rawCookie ?? '';
      refreshCookie = refreshCookie ?? '';
    });

    it('should return new accessToken with valid refresh cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
    });

    it('should return 401 without refresh cookie', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });
  });

  // ─── Change Password ─────────────────────────────────────────────────────────

  describe('PATCH /auth/change-password', () => {
    let accessToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser);
      accessToken = res.body.accessToken;
    });

    it('should return 400 with wrong current password', async () => {
      await request(app.getHttpServer())
        .patch('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword1',
          newPassword: 'NewPassword123',
        })
        .expect(400);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .patch('/auth/change-password')
        .send({ currentPassword: testUser.password, newPassword: 'New123456' })
        .expect(401);
    });
  });

  // ─── Logout ──────────────────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    let accessToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser);
      accessToken = res.body.accessToken;
    });

    it('should logout successfully', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });
});
