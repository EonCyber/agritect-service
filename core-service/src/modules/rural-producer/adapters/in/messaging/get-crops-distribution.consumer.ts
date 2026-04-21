import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { GetCropsDistributionQuery } from '../../../app/queries/interfaces/get-crops-distribution.query';
import type { CropsDistributionItem } from '../../../app/ports/dashboard-read.port';
import { EmptyPayloadDto } from './dtos';

@Controller()
export class GetCropsDistributionConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.dashboard.crops-distribution',
    summary: 'Retorna a distribuição de culturas agrícolas por área plantada (sem payload)',
    message: { name: 'EmptyPayload', payload: EmptyPayloadDto },
  })
  @MessagePattern('rural-producer.dashboard.crops-distribution')
  execute(): Promise<CropsDistributionItem[]> {
    return this.queryBus.execute(new GetCropsDistributionQuery());
  }
}
