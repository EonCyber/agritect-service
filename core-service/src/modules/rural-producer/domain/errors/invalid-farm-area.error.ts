import { DomainError } from './domain.error';

export class InvalidFarmAreaError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
