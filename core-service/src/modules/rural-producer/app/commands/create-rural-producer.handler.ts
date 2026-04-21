import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateRuralProducerCommand } from './interfaces/create-rural-producer.command';
import type { RuralProducerRepositoryPort } from '../ports/rural-producer-repository.port';
import type { ProcessRepositoryPort } from '../ports/process-repository.port';
import { RuralProducer } from '../../domain/entities/rural-producer';
import { CommandExecution } from '../../domain/entities/command-execution';

export const RURAL_PRODUCER_REPOSITORY = 'RURAL_PRODUCER_REPOSITORY';
export const PROCESS_REPOSITORY = 'PROCESS_REPOSITORY';

export interface CommandExecutionResult {
  processId: string;
  status: string;
}

@CommandHandler(CreateRuralProducerCommand)
export class CreateRuralProducerCommandHandler
  implements ICommandHandler<CreateRuralProducerCommand, CommandExecutionResult>
{
  constructor(
    @Inject(RURAL_PRODUCER_REPOSITORY)
    private readonly repository: RuralProducerRepositoryPort,
    @Inject(PROCESS_REPOSITORY)
    private readonly processRepository: ProcessRepositoryPort,
  ) {}

  async execute(command: CreateRuralProducerCommand): Promise<CommandExecutionResult> {
    const execution = new CommandExecution(randomUUID(), CreateRuralProducerCommand.name);
    await this.processRepository.save(execution);

    execution.markRunning();
    await this.processRepository.update(execution);

    try {
      const producer = new RuralProducer(
        command.id,
        command.taxId,
        command.taxIdType,
        command.name,
      );
      await this.repository.save(producer);
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
