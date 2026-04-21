import { DomainError } from './domain.error';

export class InvalidTaxIdTypeError extends DomainError {
  constructor(validValues: string[]) {
    super(`taxIdType must be one of: ${validValues.join(', ')}.`);
  }
}
