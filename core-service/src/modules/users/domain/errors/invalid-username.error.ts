import { DomainError } from './domain.error';

export class InvalidUsernameError extends DomainError {
  constructor(minLength: number) {
    super(`Username must have at least ${minLength} characters.`);
  }
}
