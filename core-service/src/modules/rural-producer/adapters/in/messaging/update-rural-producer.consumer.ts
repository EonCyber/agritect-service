import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { UpdateRuralProducerCommand } from '../../../app/commands/interfaces/update-rural-producer.command';
import { UpdateRuralProducerPayloadDto } from './dtos';

@Controller()
export class UpdateRuralProducerConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.update',
    summary: 'Atualiza o nome de um produtor rural existente',
    message: {
      name: 'UpdateRuralProducerPayload',
      payload: UpdateRuralProducerPayloadDto,
    },
  })
  @MessagePattern('rural-producer.update')
  execute(@Payload() payload: UpdateRuralProducerPayloadDto): Promise<void> {
    return this.commandBus.execute(
      new UpdateRuralProducerCommand(payload.id, payload.name),
    );
  }
}
