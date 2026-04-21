import { DomainError } from './domain.error';

export class RuralProducerNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Rural producer with id "${id}" not found.`);
  }
}
