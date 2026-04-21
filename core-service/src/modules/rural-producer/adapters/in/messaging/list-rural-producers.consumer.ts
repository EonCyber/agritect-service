import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { ListRuralProducersQuery } from '../../../app/queries/interfaces/list-rural-producers.query';
import type { RuralProducerListItem } from '../../../app/ports/rural-producer-read.port';
import { EmptyPayloadDto } from './dtos';

@Controller()
export class ListRuralProducersConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.list',
    summary: 'Lista todos os produtores rurais cadastrados (sem payload)',
    message: { name: 'EmptyPayload', payload: EmptyPayloadDto },
  })
  @MessagePattern('rural-producer.list')
  execute(): Promise<RuralProducerListItem[]> {
    return this.queryBus.execute(new ListRuralProducersQuery());
  }
}
