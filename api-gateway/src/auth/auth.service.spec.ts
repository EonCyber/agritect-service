import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { NatsPublisherService } from '../messaging/nats-publisher.service';
import { ValidateUserResultDto } from '../models/results-dtos/validate-user-result.dto';
import { UserResultDto } from '../models/results-dtos/user-result.dto';
import { AuthService } from './auth.service';

const mockPublisher = {
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  validateUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed.jwt.token'),
};

const createdUser: UserResultDto = {
  id: 'uuid-1',
  username: 'alice',
  email: 'a@b.com',
  roles: ['user'],
  active: true,
};

const activeUser: ValidateUserResultDto = {
  id: 'uuid-1',
  email: 'a@b.com',
  passwordHash: '$hashed',
  roles: ['user'],
  active: true,
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: NatsPublisherService, useValue: mockPublisher },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── signUp ──────────────────────────────────────────────────────────────────

  describe('signUp()', () => {
    beforeEach(() => {
      mockPublisher.getUserByEmail.mockRejectedValue(new Error('not found'));
      mockPublisher.createUser.mockResolvedValue(createdUser);
    });

    it('creates user and returns auth response', async () => {
      const result = await service.signUp('alice', 'a@b.com', 'pass1234');

      expect(mockPublisher.getUserByEmail).toHaveBeenCalledTimes(1);
      expect(mockPublisher.createUser).toHaveBeenCalledTimes(1);
      expect(mockPublisher.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'alice',
          email: 'a@b.com',
          password: 'pass1234',
          roles: ['user'],
        }),
      );
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.tokenType).toBe('Bearer');
    });

    it('throws ConflictException when email already exists', async () => {
      mockPublisher.getUserByEmail.mockResolvedValue({ id: 'existing' });

      await expect(service.signUp('alice', 'a@b.com', 'pass1234')).rejects.toThrow(
        ConflictException,
      );
      expect(mockPublisher.createUser).not.toHaveBeenCalled();
    });
  });

  // ─── login ───────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('returns auth response on valid credentials', async () => {
      mockPublisher.validateUser.mockResolvedValue(activeUser);

      const result = await service.login('a@b.com', 'pass1234');

      expect(mockPublisher.validateUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'a@b.com', password: 'pass1234' }),
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 'uuid-1', email: 'a@b.com' }),
      );
      expect(result.accessToken).toBe('signed.jwt.token');
    });

    it('throws UnauthorizedException when validateUser fails', async () => {
      mockPublisher.validateUser.mockRejectedValue(new Error('not found'));

      await expect(service.login('a@b.com', 'pass1234')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user is inactive', async () => {
      mockPublisher.validateUser.mockResolvedValue({ ...activeUser, active: false });

      await expect(service.login('a@b.com', 'pass1234')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── validate ────────────────────────────────────────────────────────────────

  describe('validate()', () => {
    it('returns user when credentials are valid', async () => {
      mockPublisher.validateUser.mockResolvedValue(activeUser);

      const result = await service.validate('a@b.com', 'pass1234');

      expect(mockPublisher.validateUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'a@b.com', password: 'pass1234' }),
      );
      expect(result).toEqual(activeUser);
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      mockPublisher.validateUser.mockRejectedValue(new Error('not found'));

      await expect(service.validate('a@b.com', 'pass1234')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user is inactive', async () => {
      mockPublisher.validateUser.mockResolvedValue({ ...activeUser, active: false });

      await expect(service.validate('a@b.com', 'pass1234')).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('returns logout response message', () => {
      const result = service.logout();

      expect(result.message).toBe('Logged out successfully');
    });
  });
});
