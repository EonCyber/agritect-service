import { Test, TestingModule } from '@nestjs/testing';
import {
  UpdateUserCommandHandler,
  USER_REPOSITORY,
  PROCESS_REPOSITORY,
} from '../../../../src/modules/users/app/commands/update-user.handler';
import { UpdateUserCommand } from '../../../../src/modules/users/app/commands/interfaces/update-user.command';
import { User } from '../../../../src/modules/users/domain/entities/user';
import { UserNotFoundError } from '../../../../src/modules/users/domain/errors/user-not-found.error';

const makeUser = () =>
  new User('uuid-1', 'johndoe', 'john@example.com', 'hashed_password', true, ['user']);

describe('UpdateUserCommandHandler', () => {
  let handler: UpdateUserCommandHandler;
  const mockRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    delete: jest.fn(),
  };
  const mockProcessRepository = {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockProcessRepository.save.mockResolvedValue(undefined);
    mockProcessRepository.update.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserCommandHandler,
        { provide: USER_REPOSITORY, useValue: mockRepository },
        { provide: PROCESS_REPOSITORY, useValue: mockProcessRepository },
      ],
    }).compile();

    handler = module.get(UpdateUserCommandHandler);
  });

  it('should update username and roles and return COMPLETED status', async () => {
    const existing = makeUser();
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.save.mockResolvedValue(undefined);

    const command = new UpdateUserCommand('uuid-1', 'newusername', true, ['admin', 'user']);
    const result = await handler.execute(command);

    expect(mockRepository.findById).toHaveBeenCalledWith('uuid-1');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    const saved: User = mockRepository.save.mock.calls[0][0];
    expect(saved.username).toBe('newusername');
    expect(saved.email).toBe(existing.email);
    expect(saved.passwordHash).toBe(existing.passwordHash);
    expect(saved.roles).toEqual(['admin', 'user']);
    expect(result.processId).toBeDefined();
    expect(result.status).toBe('COMPLETED');
  });

  it('should deactivate user when active is false', async () => {
    const existing = makeUser();
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.save.mockResolvedValue(undefined);

    const command = new UpdateUserCommand('uuid-1', 'johndoe', false, ['user']);
    await handler.execute(command);

    const saved: User = mockRepository.save.mock.calls[0][0];
    expect(saved.active).toBe(false);
  });

  it('should throw UserNotFoundError when user does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const command = new UpdateUserCommand('nonexistent', 'newname', true, []);
    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should mark process as FAILED when repository throws during save', async () => {
    const existing = makeUser();
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.save.mockRejectedValue(new Error('DB error'));

    const command = new UpdateUserCommand('uuid-1', 'newname', true, []);
    await expect(handler.execute(command)).rejects.toThrow('DB error');

    const updateCalls = mockProcessRepository.update.mock.calls;
    const lastUpdate = updateCalls[updateCalls.length - 1][0];
    expect(lastUpdate.status).toBe('FAILED');
  });
});
