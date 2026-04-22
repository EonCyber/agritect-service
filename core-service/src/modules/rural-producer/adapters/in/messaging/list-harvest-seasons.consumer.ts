import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { ListHarvestSeasonsQuery } from '../../../app/queries/interfaces/list-harvest-seasons.query';
import type { HarvestSeasonListItem } from '../../../app/ports/harvest-season-read.port';
import { EmptyPayloadDto } from './dtos';

@Controller()
export class ListHarvestSeasonsConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.harvest-season.list',
    summary: 'Lista todas as safras cadastradas com seus IDs (sem payload)',
    message: { name: 'EmptyPayload', payload: EmptyPayloadDto },
  })
  @MessagePattern('rural-producer.harvest-season.list')
  execute(): Promise<HarvestSeasonListItem[]> {
    return this.queryBus.execute(new ListHarvestSeasonsQuery());
  }
}
