import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { ListCropsQuery } from '../../../app/queries/interfaces/list-crops.query';
import type { CropListItem } from '../../../app/ports/crop-read.port';
import { EmptyPayloadDto } from './dtos';

@Controller()
export class ListCropsConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.crop.list',
    summary: 'Lista todas as culturas agrícolas cadastradas com seus IDs (sem payload)',
    message: { name: 'EmptyPayload', payload: EmptyPayloadDto },
  })
  @MessagePattern('rural-producer.crop.list')
  execute(): Promise<CropListItem[]> {
    return this.queryBus.execute(new ListCropsQuery());
  }
}
