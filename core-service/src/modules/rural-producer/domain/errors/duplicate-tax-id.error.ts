import { DomainError } from './domain.error';

export class DuplicateTaxIdError extends DomainError {
  constructor(taxId: string) {
    super(`A rural producer with taxId "${taxId}" already exists.`);
  }
}
