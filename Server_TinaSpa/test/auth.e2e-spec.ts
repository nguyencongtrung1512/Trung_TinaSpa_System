import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';
import { RoleName } from '../src/common/constants/roles.js';
import { setupApp } from '../src/common/setup-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    fullName: string;
    isActive: boolean;
  };
  roles: string[];
};

describe('Authentication & Authorization (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const createdPhones: string[] = [];

  const uniquePhone = () => {
    const phone = `09${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10)}`;
    createdPhones.push(phone);
    return phone;
  };

  const registerUser = async (
    overrides: Partial<{ phone: string; password: string; fullName: string }> = {},
  ) => {
    const payload = {
      phone: uniquePhone(),
      password: 'Password1',
      fullName: 'Test User',
      ...overrides,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(payload);

    return { payload, response };
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    prisma = app.get(PrismaService);

    await prisma.role.upsert({
      where: { name: RoleName.ADMIN },
      update: {},
      create: { name: RoleName.ADMIN, description: 'Administrator' },
    });
    await prisma.role.upsert({
      where: { name: RoleName.STAFF },
      update: {},
      create: { name: RoleName.STAFF, description: 'Staff' },
    });
    await prisma.role.upsert({
      where: { name: RoleName.CUSTOMER },
      update: {},
      create: { name: RoleName.CUSTOMER, description: 'Customer' },
    });
  });

  afterAll(async () => {
    if (createdPhones.length > 0) {
      await prisma.user.deleteMany({
        where: { phone: { in: createdPhones } },
      });
    }
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('registers successfully', async () => {
      const { payload, response } = await registerUser({
        fullName: 'Nguyen Van A',
      });

      expect(response.status).toBe(201);
      const body = response.body as AuthResponse;
      expect(body.accessToken).toEqual(expect.any(String));
      expect(body.refreshToken).toEqual(expect.any(String));
      expect(body.roles).toEqual([RoleName.CUSTOMER]);
      expect(body.user.phone).toBe(payload.phone);
      expect(body.user.fullName).toBe('Nguyen Van A');
      expect(body.user).not.toHaveProperty('passwordHash');
      expect(body).not.toHaveProperty('password');
    });

    it('rejects duplicate phone', async () => {
      const { payload } = await registerUser();

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: payload.phone,
          password: 'Password1',
          fullName: 'Another User',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Phone number already registered');
    });

    it('rejects invalid register payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          phone: '',
          password: '123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('logs in successfully', async () => {
      const { payload } = await registerUser({ fullName: 'Login User' });

      const response = await request(app.getHttpServer()).post('/auth/login').send({
        phone: payload.phone,
        password: payload.password,
      });

      expect(response.status).toBe(200);
      const body = response.body as AuthResponse;
      expect(body.accessToken).toEqual(expect.any(String));
      expect(body.refreshToken).toEqual(expect.any(String));
      expect(body.user.phone).toBe(payload.phone);
      expect(body.roles).toContain(RoleName.CUSTOMER);
      expect(body.user).not.toHaveProperty('passwordHash');
    });

    it('rejects unknown phone with generic error', async () => {
      const response = await request(app.getHttpServer()).post('/auth/login').send({
        phone: '0990000000',
        password: 'Password1',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('rejects wrong password with generic error', async () => {
      const { payload } = await registerUser();

      const response = await request(app.getHttpServer()).post('/auth/login').send({
        phone: payload.phone,
        password: 'WrongPassword1',
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('rejects inactive user', async () => {
      const { payload, response: registerResponse } = await registerUser();
      const userId = (registerResponse.body as AuthResponse).user.id;

      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });

      const response = await request(app.getHttpServer()).post('/auth/login').send({
        phone: payload.phone,
        password: payload.password,
      });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Account is inactive');
    });
  });

  describe('GET /auth/me JWT', () => {
    it('accepts a valid access token', async () => {
      const { response: registerResponse } = await registerUser({
        fullName: 'Me User',
      });
      const tokens = registerResponse.body as AuthResponse;

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.phone).toBe(tokens.user.phone);
      expect(response.body.roles).toEqual([RoleName.CUSTOMER]);
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('rejects an invalid access token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer not-a-valid-token');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid access token');
    });

    it('rejects an expired access token', async () => {
      const { response: registerResponse } = await registerUser();
      const body = registerResponse.body as AuthResponse;
      const expiredToken = jwt.sign(
        {
          sub: body.user.id,
          phone: body.user.phone,
          roles: body.roles,
        },
        process.env.JWT_ACCESS_SECRET as string,
        { expiresIn: -60 },
      );

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token expired');
    });

    it('rejects a missing access token', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Missing access token');
    });
  });

  describe('POST /auth/refresh', () => {
    it('requires refreshToken', async () => {
      const response = await request(app.getHttpServer()).post('/auth/refresh').send({});

      expect(response.status).toBe(400);
    });

    it('refreshes successfully and rotates the token', async () => {
      const { response: registerResponse } = await registerUser();
      const original = registerResponse.body as AuthResponse;

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: original.refreshToken });

      expect(refreshResponse.status).toBe(200);
      const rotated = refreshResponse.body as AuthResponse;
      expect(rotated.accessToken).toEqual(expect.any(String));
      expect(rotated.refreshToken).toEqual(expect.any(String));
      expect(rotated.refreshToken).not.toBe(original.refreshToken);

      const reuseResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: original.refreshToken });

      expect(reuseResponse.status).toBe(401);
      expect(reuseResponse.body.message).toBe('Refresh token revoked');

      const nextRefresh = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: rotated.refreshToken });

      expect(nextRefresh.status).toBe(200);
    });

    it('rejects an expired refresh token', async () => {
      const { response: registerResponse } = await registerUser();
      const body = registerResponse.body as AuthResponse;
      const expiredRefreshToken = jwt.sign(
        {
          sub: body.user.id,
          jti: 'expired-jti',
        },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: -60 },
      );

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: expiredRefreshToken });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Refresh token expired');
    });

    it('rejects a revoked refresh token', async () => {
      const { response: registerResponse } = await registerUser();
      const body = registerResponse.body as AuthResponse;

      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken: body.refreshToken });

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: body.refreshToken });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Refresh token revoked');
    });
  });

  describe('POST /auth/logout', () => {
    it('logs out successfully', async () => {
      const { response: registerResponse } = await registerUser();
      const body = registerResponse.body as AuthResponse;

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken: body.refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out');
    });

    it('rejects refresh after logout', async () => {
      const { response: registerResponse } = await registerUser();
      const body = registerResponse.body as AuthResponse;

      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({ refreshToken: body.refreshToken });

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: body.refreshToken });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Refresh token revoked');
    });
  });

  describe('GET /users/admin-test roles', () => {
    it('allows ADMIN', async () => {
      const { response: registerResponse } = await registerUser();
      const body = registerResponse.body as AuthResponse;
      const adminRole = await prisma.role.findUniqueOrThrow({
        where: { name: RoleName.ADMIN },
      });

      await prisma.userRole.create({
        data: {
          userId: body.user.id,
          roleId: adminRole.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/users/admin-test')
        .set('Authorization', `Bearer ${body.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Admin access granted');
    });

    it('forbids STAFF', async () => {
      const { response: registerResponse } = await registerUser();
      const body = registerResponse.body as AuthResponse;
      const staffRole = await prisma.role.findUniqueOrThrow({
        where: { name: RoleName.STAFF },
      });

      await prisma.userRole.create({
        data: {
          userId: body.user.id,
          roleId: staffRole.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/users/admin-test')
        .set('Authorization', `Bearer ${body.accessToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Insufficient role');
    });

    it('forbids CUSTOMER', async () => {
      const { response: registerResponse } = await registerUser();
      const body = registerResponse.body as AuthResponse;

      const response = await request(app.getHttpServer())
        .get('/users/admin-test')
        .set('Authorization', `Bearer ${body.accessToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Insufficient role');
    });
  });
});
