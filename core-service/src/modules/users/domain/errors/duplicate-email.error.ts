import { DomainError } from './domain.error';

export class DuplicateEmailError extends DomainError {
  constructor(email: string) {
    super(`A user with email "${email}" already exists.`);
  }
}
