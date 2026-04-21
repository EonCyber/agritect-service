import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { RemovePlantingCommand } from '../../../app/commands/interfaces/remove-planting.command';
import { RemovePlantingPayloadDto } from './dtos';

@Controller()
export class RemovePlantingConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.planting.remove',
    summary: 'Remove um plantio de uma fazenda do produtor rural',
    message: {
      name: 'RemovePlantingPayload',
      payload: RemovePlantingPayloadDto,
    },
  })
  @MessagePattern('rural-producer.planting.remove')
  execute(@Payload() payload: RemovePlantingPayloadDto): Promise<void> {
    return this.commandBus.execute(
      new RemovePlantingCommand(
        payload.ruralProducerId,
        payload.farmId,
        payload.cropId,
        payload.harvestSeasonId,
      ),
    );
  }
}
