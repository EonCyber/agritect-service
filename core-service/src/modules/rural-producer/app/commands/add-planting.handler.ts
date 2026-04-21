import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AddPlantingCommand } from './interfaces/add-planting.command';
import type { RuralProducerRepositoryPort } from '../ports/rural-producer-repository.port';
import type { ProcessRepositoryPort } from '../ports/process-repository.port';
import { RuralProducerNotFoundError } from '../../domain/errors/rural-producer-not-found.error';
import { FarmNotFoundError } from '../../domain/errors/farm-not-found.error';
import { CommandExecution } from '../../domain/entities/command-execution';
import type { CommandExecutionResult } from './create-rural-producer.handler';

export const RURAL_PRODUCER_REPOSITORY = 'RURAL_PRODUCER_REPOSITORY';
export const PROCESS_REPOSITORY = 'PROCESS_REPOSITORY';

@CommandHandler(AddPlantingCommand)
export class AddPlantingCommandHandler
  implements ICommandHandler<AddPlantingCommand, CommandExecutionResult>
{
  constructor(
    @Inject(RURAL_PRODUCER_REPOSITORY)
    private readonly repository: RuralProducerRepositoryPort,
    @Inject(PROCESS_REPOSITORY)
    private readonly processRepository: ProcessRepositoryPort,
  ) {}

  async execute(command: AddPlantingCommand): Promise<CommandExecutionResult> {
    const execution = new CommandExecution(randomUUID(), AddPlantingCommand.name);
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
      farm.addPlanting(command.cropId, command.harvestSeasonId);
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
