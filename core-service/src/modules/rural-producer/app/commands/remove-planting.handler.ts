import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RemovePlantingCommand } from './interfaces/remove-planting.command';
import type { RuralProducerRepositoryPort } from '../ports/rural-producer-repository.port';
import type { ProcessRepositoryPort } from '../ports/process-repository.port';
import { RuralProducerNotFoundError } from '../../domain/errors/rural-producer-not-found.error';
import { FarmNotFoundError } from '../../domain/errors/farm-not-found.error';
import { CommandExecution } from '../../domain/entities/command-execution';
import type { CommandExecutionResult } from './create-rural-producer.handler';

export const RURAL_PRODUCER_REPOSITORY = 'RURAL_PRODUCER_REPOSITORY';
export const PROCESS_REPOSITORY = 'PROCESS_REPOSITORY';

@CommandHandler(RemovePlantingCommand)
export class RemovePlantingCommandHandler
  implements ICommandHandler<RemovePlantingCommand, CommandExecutionResult>
{
  constructor(
    @Inject(RURAL_PRODUCER_REPOSITORY)
    private readonly repository: RuralProducerRepositoryPort,
    @Inject(PROCESS_REPOSITORY)
    private readonly processRepository: ProcessRepositoryPort,
  ) {}

  async execute(command: RemovePlantingCommand): Promise<CommandExecutionResult> {
    const execution = new CommandExecution(randomUUID(), RemovePlantingCommand.name);
    await this.processRepository.save(execution);

    execution.markRunning();
    await this.processRepository.update(execution);

    try {
      const producer = await this.repository.findById(command.ruralProducerId);
      if (!producer) {
        throw new RuralProducerNotFoundError(command.ruralProducerId);
      }
      const farm = producer.farms.find((f) => f.id === command.farmId);
      if (!farm) {
        throw new FarmNotFoundError(command.farmId);
      }
      farm.removePlanting(command.cropId, command.harvestSeasonId);
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
