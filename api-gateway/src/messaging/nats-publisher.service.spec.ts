import { BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { NATS_SERVICE } from './nats-subjects';
import { NatsPublisherService } from './nats-publisher.service';

describe('NatsPublisherService - Error Handling', () => {
  let service: NatsPublisherService;
  let mockClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    mockClient = {
      send: jest.fn(),
    } as unknown as jest.Mocked<ClientProxy>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NatsPublisherService,
        { provide: NATS_SERVICE, useValue: mockClient },
      ],
    }).compile();

    service = module.get(NatsPublisherService);
  });

  it('should throw BadRequestException when core-service returns error response', async () => {
    const errorResponse = {
      status: 'error',
      error: 'InvalidPasswordError',
      message: 'Password must have at least 6 characters',
      timestamp: '2026-04-21T21:47:50.068Z',
    };

    mockClient.send.mockReturnValue(of(errorResponse));

    await expect(
      service['send']('user.create', { email: 'test@test.com', password: '123' }),
    ).rejects.toThrow(new BadRequestException('Password must have at least 6 characters'));
  });

  it('should return data when core-service returns success response', async () => {
    const successResponse = {
      id: 'user-1',
      email: 'test@test.com',
      username: 'testuser',
      roles: ['user'],
      active: true,
    };

    mockClient.send.mockReturnValue(of(successResponse));

    const result = await service['send']('user.create', { email: 'test@test.com' });

    expect(result).toEqual(successResponse);
  });

  it('should propagate NATS transport errors', async () => {
    mockClient.send.mockReturnValue(throwError(() => new Error('Connection timeout')));

    await expect(service['send']('user.create', { email: 'test@test.com' })).rejects.toThrow(
      'Connection timeout',
    );
  });
});
