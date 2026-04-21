import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListRuralProducersQuery } from './interfaces/list-rural-producers.query';
import type { RuralProducerReadPort, RuralProducerListItem } from '../ports/rural-producer-read.port';

export const RURAL_PRODUCER_READ = 'RURAL_PRODUCER_READ';

@QueryHandler(ListRuralProducersQuery)
export class ListRuralProducersQueryHandler
  implements IQueryHandler<ListRuralProducersQuery, RuralProducerListItem[]>
{
  constructor(
    @Inject(RURAL_PRODUCER_READ)
    private readonly readPort: RuralProducerReadPort,
  ) {}

  execute(_query: ListRuralProducersQuery): Promise<RuralProducerListItem[]> {
    return this.readPort.list();
  }
}
