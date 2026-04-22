import { DomainError } from './domain.error';

export class InvalidPasswordHashError extends DomainError {
  constructor() {
    super('Password hash cannot be empty.');
  }
}
