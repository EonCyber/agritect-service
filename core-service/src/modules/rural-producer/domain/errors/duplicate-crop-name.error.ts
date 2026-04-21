import { DomainError } from './domain.error';

export class DuplicateCropNameError extends DomainError {
  constructor(name: string) {
    super(`A crop with name "${name}" already exists.`);
  }
}
