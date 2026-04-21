import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { AddPlantingCommand } from '../../../app/commands/interfaces/add-planting.command';
import { AddPlantingPayloadDto } from './dtos';

@Controller()
export class AddPlantingConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.planting.add',
    summary: 'Adiciona um plantio a uma fazenda do produtor rural',
    message: {
      name: 'AddPlantingPayload',
      payload: AddPlantingPayloadDto,
    },
  })
  @MessagePattern('rural-producer.planting.add')
  execute(@Payload() payload: AddPlantingPayloadDto): Promise<void> {
    return this.commandBus.execute(
      new AddPlantingCommand(
        payload.ruralProducerId,
        payload.farmId,
        payload.cropId,
        payload.harvestSeasonId,
      ),
    );
  }
}
