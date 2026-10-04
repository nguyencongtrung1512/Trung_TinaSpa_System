import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';

vi.mock('bcrypt', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: {
    create: ReturnType<typeof vi.fn>;
    findByPhone: ReturnType<typeof vi.fn>;
    findByUserID: ReturnType<typeof vi.fn>;
    findByUserAID: ReturnType<typeof vi.fn>;
    getRoleNames: ReturnType<typeof vi.fn>;
    toPublicUser: ReturnType<typeof vi.fn>;
  };
  let prisma: {
    refreshToken: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let jwtService: {
    signAsync: ReturnType<typeof vi.fn>;
    verifyAsync: ReturnType<typeof vi.fn>;
  };

  const user = {
    userAID: '20261004000001',
    userID: '20260930000017',
    phone: '0901234567',
    passwordHash: 'hashed-password',
    fullName: 'Test User',
    role: 'CUSTOMER',
    isActive: true,
    createdAt: new Date(),
    createdByAID: null,
    updatedAt: new Date(),
    updatedByAID: null,
    note: null,
  };

  const storedRefreshToken = (overrides: Record<string, unknown> = {}) => ({
    refreshTokenAID: '20261004000010',
    refreshTokenID: '20260930000023',
    userAID: user.userAID,
    tokenJti: 'token-1',
    tokenHash: 'hash',
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    ...overrides,
  });

  beforeEach(async () => {
    usersService = {
      create: vi.fn(),
      findByPhone: vi.fn(),
      findByUserID: vi.fn(),
      findByUserAID: vi.fn(),
      getRoleNames: vi.fn().mockReturnValue(['CUSTOMER']),
      toPublicUser: vi.fn().mockReturnValue({
        userID: user.userID,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        isActive: true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    };
    prisma = {
      refreshToken: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };
    jwtService = {
      signAsync: vi.fn().mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token'),
      verifyAsync: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((_key: string, fallback: string) => fallback),
            getOrThrow: vi.fn((key: string) => `${key}-value`),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
  });

  describe('register', () => {
    it('registers a user and returns tokens', async () => {
      usersService.create.mockResolvedValue(user);

      const result = await authService.register({
        phone: user.phone,
        password: 'Password1',
        fullName: user.fullName,
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.roles).toEqual(['CUSTOMER']);
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('userAID');
      expect(prisma.refreshToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userAID: user.userAID,
          tokenJti: expect.any(String),
        }),
      });
    });

    it('signs tokens with userID as subject', async () => {
      usersService.create.mockResolvedValue(user);

      await authService.register({
        phone: user.phone,
        password: 'Password1',
        fullName: user.fullName,
      });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({ sub: user.userID }),
        expect.anything(),
      );
    });

    it('throws 409 when phone already exists', async () => {
      usersService.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '6.0.0',
        }),
      );

      await expect(
        authService.register({
          phone: user.phone,
          password: 'Password1',
          fullName: user.fullName,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('logs in with valid credentials', async () => {
      usersService.findByPhone.mockResolvedValue(user);

      const result = await authService.login({
        phone: user.phone,
        password: 'Password1',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.roles).toEqual(['CUSTOMER']);
    });

    it('rejects unknown phone with generic credentials error', async () => {
      usersService.findByPhone.mockResolvedValue(null);

      await expect(
        authService.login({ phone: '0999999999', password: 'Password1' }),
      ).rejects.toMatchObject({
        status: 401,
        message: 'Invalid credentials',
      });
    });

    it('rejects wrong password with generic credentials error', async () => {
      usersService.findByPhone.mockResolvedValue(user);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(
        authService.login({ phone: user.phone, password: 'WrongPass' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects inactive users', async () => {
      usersService.findByPhone.mockResolvedValue({ ...user, isActive: false });

      await expect(
        authService.login({ phone: user.phone, password: 'Password1' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('refresh', () => {
    it('rotates refresh tokens', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: user.userID, jti: 'token-1' });
      prisma.refreshToken.findUnique.mockResolvedValue(storedRefreshToken());
      usersService.findByUserAID.mockResolvedValue(user);

      const result = await authService.refresh('old-refresh-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { refreshTokenAID: '20261004000010' },
        data: { revokedAt: expect.any(Date) },
      });
      expect(usersService.findByUserAID).toHaveBeenCalledWith(user.userAID);
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('rejects tokens whose jti does not match', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: user.userID, jti: 'other-jti' });
      prisma.refreshToken.findUnique.mockResolvedValue(storedRefreshToken());

      await expect(authService.refresh('tampered-token')).rejects.toMatchObject({
        message: 'Invalid refresh token',
      });
    });

    it('rejects revoked refresh tokens', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: user.userID, jti: 'token-1' });
      prisma.refreshToken.findUnique.mockResolvedValue(
        storedRefreshToken({ revokedAt: new Date() }),
      );

      await expect(authService.refresh('revoked-token')).rejects.toMatchObject({
        message: 'Refresh token revoked',
      });
    });

    it('rejects expired refresh tokens', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: user.userID, jti: 'token-1' });
      prisma.refreshToken.findUnique.mockResolvedValue(
        storedRefreshToken({ expiresAt: new Date(Date.now() - 1_000) }),
      );

      await expect(authService.refresh('expired-token')).rejects.toMatchObject({
        message: 'Refresh token expired',
      });
    });
  });
});
