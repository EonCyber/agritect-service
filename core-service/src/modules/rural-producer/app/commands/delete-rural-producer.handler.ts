import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DeleteRuralProducerCommand } from './interfaces/delete-rural-producer.command';
import type { RuralProducerRepositoryPort } from '../ports/rural-producer-repository.port';
import type { ProcessRepositoryPort } from '../ports/process-repository.port';
import { CommandExecution } from '../../domain/entities/command-execution';
import type { CommandExecutionResult } from './create-rural-producer.handler';

export const RURAL_PRODUCER_REPOSITORY = 'RURAL_PRODUCER_REPOSITORY';
export const PROCESS_REPOSITORY = 'PROCESS_REPOSITORY';

@CommandHandler(DeleteRuralProducerCommand)
export class DeleteRuralProducerCommandHandler
  implements ICommandHandler<DeleteRuralProducerCommand, CommandExecutionResult>
{
  constructor(
    @Inject(RURAL_PRODUCER_REPOSITORY)
    private readonly repository: RuralProducerRepositoryPort,
    @Inject(PROCESS_REPOSITORY)
    private readonly processRepository: ProcessRepositoryPort,
  ) {}

  async execute(command: DeleteRuralProducerCommand): Promise<CommandExecutionResult> {
    const execution = new CommandExecution(randomUUID(), DeleteRuralProducerCommand.name);
    await this.processRepository.save(execution);

    execution.markRunning();
    await this.processRepository.update(execution);

    try {
      await this.repository.delete(command.id);
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
