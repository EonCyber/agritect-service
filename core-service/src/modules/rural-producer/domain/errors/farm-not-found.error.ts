import { DomainError } from './domain.error';

export class FarmNotFoundError extends DomainError {
  constructor(farmId: string) {
    super(`Farm with id "${farmId}" not found.`);
  }
}
