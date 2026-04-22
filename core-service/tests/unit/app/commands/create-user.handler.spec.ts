import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateUserCommandHandler,
  USER_REPOSITORY,
  PROCESS_REPOSITORY,
} from '../../../../src/modules/users/app/commands/create-user.handler';
import { CreateUserCommand } from '../../../../src/modules/users/app/commands/interfaces/create-user.command';
import { User } from '../../../../src/modules/users/domain/entities/user';
import { InvalidUsernameError } from '../../../../src/modules/users/domain/errors/invalid-username.error';
import { InvalidEmailError } from '../../../../src/modules/users/domain/errors/invalid-email.error';
import { InvalidPasswordError } from '../../../../src/modules/users/domain/errors/invalid-password.error';
import { InvalidRoleError } from '../../../../src/modules/users/domain/errors/invalid-role.error';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('CreateUserCommandHandler', () => {
  let handler: CreateUserCommandHandler;
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
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserCommandHandler,
        { provide: USER_REPOSITORY, useValue: mockRepository },
        { provide: PROCESS_REPOSITORY, useValue: mockProcessRepository },
      ],
    }).compile();

    handler = module.get(CreateUserCommandHandler);
  });

  it('should save a new User with generated ID and hashed password', async () => {
    mockRepository.save.mockResolvedValue(undefined);

    const command = new CreateUserCommand(
      'johndoe',
      'john@example.com',
      'mypassword123',
      ['admin'],
    );

    const result = await handler.execute(command);

    expect(bcrypt.hash).toHaveBeenCalledWith('mypassword123', 10);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    const saved: User = mockRepository.save.mock.calls[0][0];
    expect(saved).toBeInstanceOf(User);
    expect(saved.id).toBeDefined();
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(saved.username).toBe('johndoe');
    expect(saved.email).toBe('john@example.com');
    expect(saved.passwordHash).toBe('hashed_password');
    expect(saved.roles).toEqual(['admin']);
    expect(result.processId).toBeDefined();
    expect(result.status).toBe('COMPLETED');
  });

  it('should save user with default "user" role', async () => {
    mockRepository.save.mockResolvedValue(undefined);

    const command = new CreateUserCommand(
      'janedoe',
      'jane@example.com',
      'password123',
    );

    await handler.execute(command);

    const saved: User = mockRepository.save.mock.calls[0][0];
    expect(saved.roles).toEqual(['user']);
  });

  it('should throw InvalidUsernameError for too-short username', async () => {
    const command = new CreateUserCommand('ab', 'user@example.com', 'password123');
    await expect(handler.execute(command)).rejects.toThrow(InvalidUsernameError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw InvalidEmailError for invalid email', async () => {
    const command = new CreateUserCommand('validuser', 'not-an-email', 'password123');
    await expect(handler.execute(command)).rejects.toThrow(InvalidEmailError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw InvalidPasswordError for empty password', async () => {
    const command = new CreateUserCommand('validuser', 'user@example.com', '');
    await expect(handler.execute(command)).rejects.toThrow(InvalidPasswordError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw InvalidPasswordError for too-short password', async () => {
    const command = new CreateUserCommand('validuser', 'user@example.com', '12345');
    await expect(handler.execute(command)).rejects.toThrow(InvalidPasswordError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw InvalidRoleError for invalid role', async () => {
    const command = new CreateUserCommand('validuser', 'user@example.com', 'password123', ['superadmin']);
    await expect(handler.execute(command)).rejects.toThrow(InvalidRoleError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should mark process as FAILED when repository throws', async () => {
    mockRepository.save.mockRejectedValue(new Error('DB connection failed'));

    const command = new CreateUserCommand(
      'johndoe',
      'john@example.com',
      'password123',
    );

    await expect(handler.execute(command)).rejects.toThrow('DB connection failed');

    const updateCalls = mockProcessRepository.update.mock.calls;
    const lastUpdate = updateCalls[updateCalls.length - 1][0];
    expect(lastUpdate.status).toBe('FAILED');
    expect(lastUpdate.errorMessage).toBe('DB connection failed');
  });
});
