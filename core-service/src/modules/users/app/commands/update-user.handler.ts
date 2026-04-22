import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UpdateUserCommand } from './interfaces/update-user.command';
import type { UserRepositoryPort } from '../ports/user-repository.port';
import type { ProcessRepositoryPort } from '../ports/process-repository.port';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { User } from '../../domain/entities/user';
import { CommandExecution } from '../../../rural-producer/domain/entities/command-execution';
import type { CommandExecutionResult } from './create-user.handler';

export const USER_REPOSITORY = 'USER_REPOSITORY';
export const PROCESS_REPOSITORY = 'PROCESS_REPOSITORY';

@CommandHandler(UpdateUserCommand)
export class UpdateUserCommandHandler
  implements ICommandHandler<UpdateUserCommand, CommandExecutionResult>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepositoryPort,
    @Inject(PROCESS_REPOSITORY)
    private readonly processRepository: ProcessRepositoryPort,
  ) {}

  async execute(command: UpdateUserCommand): Promise<CommandExecutionResult> {
    const execution = new CommandExecution(randomUUID(), UpdateUserCommand.name);
    await this.processRepository.save(execution);

    execution.markRunning();
    await this.processRepository.update(execution);

    try {
      const existing = await this.repository.findById(command.id);
      if (!existing) {
        throw new UserNotFoundError(command.id);
      }

      const updated = new User(
        existing.id,
        command.username,
        existing.email,
        existing.passwordHash,
        command.active,
        command.roles,
        existing.createdAt,
        new Date(),
      );
      await this.repository.save(updated);
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
