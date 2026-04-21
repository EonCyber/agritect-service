import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UpdateRuralProducerCommand } from './interfaces/update-rural-producer.command';
import type { RuralProducerRepositoryPort } from '../ports/rural-producer-repository.port';
import type { ProcessRepositoryPort } from '../ports/process-repository.port';
import { RuralProducerNotFoundError } from '../../domain/errors/rural-producer-not-found.error';
import { RuralProducer } from '../../domain/entities/rural-producer';
import { CommandExecution } from '../../domain/entities/command-execution';
import type { CommandExecutionResult } from './create-rural-producer.handler';

export const RURAL_PRODUCER_REPOSITORY = 'RURAL_PRODUCER_REPOSITORY';
export const PROCESS_REPOSITORY = 'PROCESS_REPOSITORY';

@CommandHandler(UpdateRuralProducerCommand)
export class UpdateRuralProducerCommandHandler
  implements ICommandHandler<UpdateRuralProducerCommand, CommandExecutionResult>
{
  constructor(
    @Inject(RURAL_PRODUCER_REPOSITORY)
    private readonly repository: RuralProducerRepositoryPort,
    @Inject(PROCESS_REPOSITORY)
    private readonly processRepository: ProcessRepositoryPort,
  ) {}

  async execute(command: UpdateRuralProducerCommand): Promise<CommandExecutionResult> {
    const execution = new CommandExecution(randomUUID(), UpdateRuralProducerCommand.name);
    await this.processRepository.save(execution);

    execution.markRunning();
    await this.processRepository.update(execution);

    try {
      const existing = await this.repository.findById(command.id);
      if (!existing) {
        throw new RuralProducerNotFoundError(command.id);
      }
      const updated = new RuralProducer(
        existing.id,
        existing.taxId,
        existing.taxIdType,
        command.name,
        [...existing.farms],
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
