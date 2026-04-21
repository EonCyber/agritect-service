import { Injectable } from '@nestjs/common';
import {
  RuralProducerReadPort,
  RuralProducerReadModel,
  RuralProducerListItem,
} from '../../app/ports/rural-producer-read.port';
import { PrismaRuralProducerRepository } from '../../infra/persistence/prisma-rural-producer.repository';

@Injectable()
export class RuralProducerReadAdapter implements RuralProducerReadPort {
  constructor(private readonly repo: PrismaRuralProducerRepository) {}

  findById(id: string): Promise<RuralProducerReadModel | null> {
    return this.repo.findByIdForRead(id);
  }

  list(): Promise<RuralProducerListItem[]> {
    return this.repo.list();
  }
}
