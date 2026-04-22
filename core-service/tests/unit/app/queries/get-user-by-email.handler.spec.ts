import { Test, TestingModule } from '@nestjs/testing';
import {
  GetUserByEmailQueryHandler,
  USER_READ,
} from '../../../../src/modules/users/app/queries/get-user-by-email.handler';
import { GetUserByEmailQuery } from '../../../../src/modules/users/app/queries/interfaces/get-user-by-email.query';
import type { UserReadModel } from '../../../../src/modules/users/app/ports/user-read.port';

const makeReadModel = (): UserReadModel => ({
  id: 'uuid-1',
  username: 'johndoe',
  email: 'john@example.com',
  active: true,
  roles: ['user'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
});

describe('GetUserByEmailQueryHandler', () => {
  let handler: GetUserByEmailQueryHandler;
  const mockReadPort = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    list: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByEmailQueryHandler,
        { provide: USER_READ, useValue: mockReadPort },
      ],
    }).compile();

    handler = module.get(GetUserByEmailQueryHandler);
  });

  it('should return UserReadModel when user is found by email', async () => {
    const model = makeReadModel();
    mockReadPort.findByEmail.mockResolvedValue(model);

    const result = await handler.execute(new GetUserByEmailQuery('john@example.com'));

    expect(mockReadPort.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(result).toBe(model);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('should return null when no user with given email exists', async () => {
    mockReadPort.findByEmail.mockResolvedValue(null);

    const result = await handler.execute(new GetUserByEmailQuery('unknown@example.com'));

    expect(result).toBeNull();
  });

  it('should propagate errors from the read port', async () => {
    mockReadPort.findByEmail.mockRejectedValue(new Error('DB error'));

    await expect(
      handler.execute(new GetUserByEmailQuery('john@example.com')),
    ).rejects.toThrow('DB error');
  });
});
