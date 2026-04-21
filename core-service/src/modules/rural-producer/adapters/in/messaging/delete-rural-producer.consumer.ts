import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { DeleteRuralProducerCommand } from '../../../app/commands/interfaces/delete-rural-producer.command';
import { DeleteRuralProducerPayloadDto } from './dtos';

@Controller()
export class DeleteRuralProducerConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.delete',
    summary: 'Remove um produtor rural pelo ID',
    message: {
      name: 'DeleteRuralProducerPayload',
      payload: DeleteRuralProducerPayloadDto,
    },
  })
  @MessagePattern('rural-producer.delete')
  execute(@Payload() payload: DeleteRuralProducerPayloadDto): Promise<void> {
    return this.commandBus.execute(new DeleteRuralProducerCommand(payload.id));
  }
}
