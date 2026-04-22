import { Test, TestingModule } from '@nestjs/testing';
import {
  ListUsersQueryHandler,
  USER_READ,
} from '../../../../src/modules/users/app/queries/list-users.handler';
import { ListUsersQuery } from '../../../../src/modules/users/app/queries/interfaces/list-users.query';
import type { UserListItem } from '../../../../src/modules/users/app/ports/user-read.port';

describe('ListUsersQueryHandler', () => {
  let handler: ListUsersQueryHandler;
  const mockReadPort = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    list: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListUsersQueryHandler,
        { provide: USER_READ, useValue: mockReadPort },
      ],
    }).compile();

    handler = module.get(ListUsersQueryHandler);
  });

  it('should return a list of user items without passwordHash', async () => {
    const items: UserListItem[] = [
      { id: 'uuid-1', username: 'johndoe', email: 'john@example.com', active: true },
      { id: 'uuid-2', username: 'janedoe', email: 'jane@example.com', active: false },
    ];
    mockReadPort.list.mockResolvedValue(items);

    const result = await handler.execute(new ListUsersQuery());

    expect(mockReadPort.list).toHaveBeenCalledTimes(1);
    expect(result).toBe(items);
    expect(result).toHaveLength(2);
    result.forEach((item) => expect(item).not.toHaveProperty('passwordHash'));
  });

  it('should return an empty array when there are no users', async () => {
    mockReadPort.list.mockResolvedValue([]);

    const result = await handler.execute(new ListUsersQuery());

    expect(result).toEqual([]);
  });

  it('should propagate errors from the read port', async () => {
    mockReadPort.list.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new ListUsersQuery())).rejects.toThrow('DB error');
  });
});
