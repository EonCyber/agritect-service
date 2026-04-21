import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { GetLandUseQuery } from '../../../app/queries/interfaces/get-land-use.query';
import type { LandUseMetrics } from '../../../app/ports/dashboard-read.port';
import { EmptyPayloadDto } from './dtos';

@Controller()
export class GetLandUseConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.dashboard.land-use',
    summary: 'Retorna as métricas de uso do solo (área agriculturável vs vegetação) (sem payload)',
    message: { name: 'EmptyPayload', payload: EmptyPayloadDto },
  })
  @MessagePattern('rural-producer.dashboard.land-use')
  execute(): Promise<LandUseMetrics> {
    return this.queryBus.execute(new GetLandUseQuery());
  }
}
