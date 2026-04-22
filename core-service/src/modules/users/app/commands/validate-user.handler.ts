import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { compare } from 'bcrypt';
import { ValidateUserCommand } from './interfaces/validate-user.command';
import type { UserRepositoryPort } from '../ports/user-repository.port';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserValidationResult {
  id: string;
  username: string;
  email: string;
  active: boolean;
  roles: string[];
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserCommandHandler
  implements ICommandHandler<ValidateUserCommand, UserValidationResult | null>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepositoryPort,
  ) {}

  async execute(command: ValidateUserCommand): Promise<UserValidationResult | null> {
    const user = await this.repository.findByEmail(command.email);
    if (!user) {
      return null;
    }

    // Compara a senha fornecida com o hash armazenado
    const isPasswordValid = await compare(command.password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      active: user.active,
      roles: [...user.roles],
    };
  }
}
