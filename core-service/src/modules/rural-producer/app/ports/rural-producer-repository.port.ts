import { RuralProducer } from '../../domain/entities/rural-producer';

export interface RuralProducerRepositoryPort {
  save(producer: RuralProducer): Promise<void>;
  findById(id: string): Promise<RuralProducer | null>;
  delete(id: string): Promise<void>;
}
