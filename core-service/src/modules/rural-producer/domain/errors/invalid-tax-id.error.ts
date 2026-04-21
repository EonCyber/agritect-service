import { DomainError } from './domain.error';

export class InvalidTaxIdError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
