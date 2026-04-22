import { Test, TestingModule } from '@nestjs/testing';
import {
  ValidateUserCommandHandler,
  USER_REPOSITORY,
} from '../../../../src/modules/users/app/commands/validate-user.handler';
import { ValidateUserCommand } from '../../../../src/modules/users/app/commands/interfaces/validate-user.command';
import { User } from '../../../../src/modules/users/domain/entities/user';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const makeUser = () =>
  new User('uuid-1', 'johndoe', 'john@example.com', 'hashed_password', true, ['user']);

describe('ValidateUserCommandHandler', () => {
  let handler: ValidateUserCommandHandler;
  const mockRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateUserCommandHandler,
        { provide: USER_REPOSITORY, useValue: mockRepository },
      ],
    }).compile();

    handler = module.get(ValidateUserCommandHandler);
  });

  it('should return UserValidationResult when user exists and password is correct', async () => {
    const user = makeUser();
    mockRepository.findByEmail.mockResolvedValue(user);

    const result = await handler.execute(new ValidateUserCommand('john@example.com', 'password123'));

    expect(mockRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('uuid-1');
    expect(result!.email).toBe('john@example.com');
    expect(result!.active).toBe(true);
    expect(result!.roles).toEqual(['user']);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('should return null when user does not exist', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);

    const result = await handler.execute(new ValidateUserCommand('unknown@example.com', 'password123'));

    expect(result).toBeNull();
  });

  it('should return null when password is incorrect', async () => {
    const user = makeUser();
    mockRepository.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await handler.execute(new ValidateUserCommand('john@example.com', 'wrongpassword'));

    expect(mockRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashed_password');
    expect(result).toBeNull();
  });

  it('should return active=false for inactive user with correct password', async () => {
    const inactiveUser = new User('uuid-2', 'inactiveuser', 'inactive@example.com', 'hash', false);
    mockRepository.findByEmail.mockResolvedValue(inactiveUser);

    const result = await handler.execute(new ValidateUserCommand('inactive@example.com', 'password123'));

    expect(result).not.toBeNull();
    expect(result!.active).toBe(false);
  });

  it('should propagate errors from the repository', async () => {
    mockRepository.findByEmail.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new ValidateUserCommand('any@example.com', 'password123'))).rejects.toThrow(
      'DB error',
    );
  });
});
