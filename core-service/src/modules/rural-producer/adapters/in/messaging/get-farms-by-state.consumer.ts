import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { GetFarmsByStateQuery } from '../../../app/queries/interfaces/get-farms-by-state.query';
import type { FarmsByStateItem } from '../../../app/ports/dashboard-read.port';
import { EmptyPayloadDto } from './dtos';

@Controller()
export class GetFarmsByStateConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.dashboard.farms-by-state',
    summary: 'Retorna o total de fazendas agrupadas por estado (sem payload)',
    message: { name: 'EmptyPayload', payload: EmptyPayloadDto },
  })
  @MessagePattern('rural-producer.dashboard.farms-by-state')
  execute(): Promise<FarmsByStateItem[]> {
    return this.queryBus.execute(new GetFarmsByStateQuery());
  }
}
