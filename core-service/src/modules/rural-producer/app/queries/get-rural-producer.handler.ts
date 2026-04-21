import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetRuralProducerQuery } from './interfaces/get-rural-producer.query';
import type { RuralProducerReadPort, RuralProducerReadModel } from '../ports/rural-producer-read.port';

export const RURAL_PRODUCER_READ = 'RURAL_PRODUCER_READ';

@QueryHandler(GetRuralProducerQuery)
export class GetRuralProducerQueryHandler
  implements IQueryHandler<GetRuralProducerQuery, RuralProducerReadModel | null>
{
  constructor(
    @Inject(RURAL_PRODUCER_READ)
    private readonly readPort: RuralProducerReadPort,
  ) {}

  execute(query: GetRuralProducerQuery): Promise<RuralProducerReadModel | null> {
    return this.readPort.findById(query.id);
  }
}
