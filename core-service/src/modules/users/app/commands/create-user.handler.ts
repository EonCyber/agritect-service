import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { hash } from 'bcrypt';
import { CreateUserCommand } from './interfaces/create-user.command';
import type { UserRepositoryPort } from '../ports/user-repository.port';
import type { ProcessRepositoryPort } from '../ports/process-repository.port';
import { User } from '../../domain/entities/user';
import { CommandExecution } from '../../../rural-producer/domain/entities/command-execution';
import { InvalidPasswordError } from '../../domain/errors/invalid-password.error';

export const USER_REPOSITORY = 'USER_REPOSITORY';
export const PROCESS_REPOSITORY = 'PROCESS_REPOSITORY';

export interface CommandExecutionResult {
  processId: string;
  status: string;
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand, CommandExecutionResult>
{
  private static readonly MIN_PASSWORD_LENGTH = 6;
  private static readonly SALT_ROUNDS = 10;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepositoryPort,
    @Inject(PROCESS_REPOSITORY)
    private readonly processRepository: ProcessRepositoryPort,
  ) {}

  async execute(command: CreateUserCommand): Promise<CommandExecutionResult> {
    const execution = new CommandExecution(randomUUID(), CreateUserCommand.name);
    await this.processRepository.save(execution);

    execution.markRunning();
    await this.processRepository.update(execution);

    try {
      // Valida o password em texto claro
      if (!command.password || command.password.length < CreateUserCommandHandler.MIN_PASSWORD_LENGTH) {
        throw new InvalidPasswordError(CreateUserCommandHandler.MIN_PASSWORD_LENGTH);
      }

      // Gera o hash do password
      const passwordHash = await hash(command.password, CreateUserCommandHandler.SALT_ROUNDS);

      // Gera o ID internamente
      const userId = randomUUID();

      const user = new User(
        userId,
        command.username,
        command.email,
        passwordHash,
        true,
        command.roles,
      );
      await this.repository.save(user);
      execution.markCompleted();
    } catch (err) {
      execution.markFailed(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      await this.processRepository.update(execution);
    }

    return { processId: execution.id, status: execution.status };
  }
}
