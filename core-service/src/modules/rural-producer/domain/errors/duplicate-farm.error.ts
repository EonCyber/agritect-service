import { DomainError } from './domain.error';

export class DuplicateFarmError extends DomainError {
  constructor(farmId: string) {
    super(`Farm ${farmId} is already registered for this producer.`);
  }
}
