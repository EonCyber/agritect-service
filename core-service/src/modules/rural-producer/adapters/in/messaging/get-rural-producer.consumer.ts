import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { GetRuralProducerQuery } from '../../../app/queries/interfaces/get-rural-producer.query';
import type { RuralProducerReadModel } from '../../../app/ports/rural-producer-read.port';
import { GetRuralProducerPayloadDto } from './dtos';

@Controller()
export class GetRuralProducerConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.get',
    summary: 'Busca um produtor rural pelo ID',
    message: {
      name: 'GetRuralProducerPayload',
      payload: GetRuralProducerPayloadDto,
    },
  })
  @MessagePattern('rural-producer.get')
  execute(
    @Payload() payload: GetRuralProducerPayloadDto,
  ): Promise<RuralProducerReadModel | null> {
    return this.queryBus.execute(new GetRuralProducerQuery(payload.id));
  }
}
