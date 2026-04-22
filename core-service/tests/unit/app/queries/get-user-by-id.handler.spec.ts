import { Test, TestingModule } from '@nestjs/testing';
import {
  GetUserByIdQueryHandler,
  USER_READ,
} from '../../../../src/modules/users/app/queries/get-user-by-id.handler';
import { GetUserByIdQuery } from '../../../../src/modules/users/app/queries/interfaces/get-user-by-id.query';
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

describe('GetUserByIdQueryHandler', () => {
  let handler: GetUserByIdQueryHandler;
  const mockReadPort = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    list: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdQueryHandler,
        { provide: USER_READ, useValue: mockReadPort },
      ],
    }).compile();

    handler = module.get(GetUserByIdQueryHandler);
  });

  it('should return UserReadModel without passwordHash when user exists', async () => {
    const model = makeReadModel();
    mockReadPort.findById.mockResolvedValue(model);

    const result = await handler.execute(new GetUserByIdQuery('uuid-1'));

    expect(mockReadPort.findById).toHaveBeenCalledWith('uuid-1');
    expect(result).toBe(model);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('should return null when user does not exist', async () => {
    mockReadPort.findById.mockResolvedValue(null);

    const result = await handler.execute(new GetUserByIdQuery('nonexistent'));

    expect(result).toBeNull();
  });

  it('should propagate errors from the read port', async () => {
    mockReadPort.findById.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetUserByIdQuery('uuid-1'))).rejects.toThrow('DB error');
  });
});
