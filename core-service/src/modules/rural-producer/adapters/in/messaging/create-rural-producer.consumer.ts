import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { CreateRuralProducerCommand } from '../../../app/commands/interfaces/create-rural-producer.command';
import { CreateRuralProducerPayloadDto } from './dtos';

@Controller()
export class CreateRuralProducerConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.create',
    summary: 'Cria um novo produtor rural',
    message: {
      name: 'CreateRuralProducerPayload',
      payload: CreateRuralProducerPayloadDto,
    },
  })
  @MessagePattern('rural-producer.create')
  execute(@Payload() payload: CreateRuralProducerPayloadDto): Promise<void> {
    return this.commandBus.execute(
      new CreateRuralProducerCommand(
        payload.id,
        payload.taxId,
        payload.taxIdType,
        payload.name,
      ),
    );
  }
}
