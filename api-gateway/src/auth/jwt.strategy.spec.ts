import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NatsPublisherService } from '../messaging/nats-publisher.service';
import { JwtStrategy } from './jwt.strategy';

const mockPublisher = {
  getUser: jest.fn(),
};

const activeUser = {
  id: 'uuid-1',
  email: 'a@b.com',
  roles: ['user'],
  active: true,
};

const jwtPayload = {
  sub: 'uuid-1',
  email: 'a@b.com',
  roles: ['user'],
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    process.env.JWT_SECRET = 'test-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: NatsPublisherService, useValue: mockPublisher },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate()', () => {
    it('returns user context when user is active', async () => {
      mockPublisher.getUser.mockResolvedValue(activeUser);

      const result = await strategy.validate(jwtPayload);

      expect(mockPublisher.getUser).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'uuid-1' }),
      );
      expect(result).toEqual({
        userId: 'uuid-1',
        email: 'a@b.com',
        roles: ['user'],
      });
    });

    it('throws UnauthorizedException when getUser throws', async () => {
      mockPublisher.getUser.mockRejectedValue(new Error('not found'));

      await expect(strategy.validate(jwtPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user is null', async () => {
      mockPublisher.getUser.mockResolvedValue(null);

      await expect(strategy.validate(jwtPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when user is inactive', async () => {
      mockPublisher.getUser.mockResolvedValue({ ...activeUser, active: false });

      await expect(strategy.validate(jwtPayload)).rejects.toThrow(
        new UnauthorizedException('User account is inactive'),
      );
    });
  });
});
