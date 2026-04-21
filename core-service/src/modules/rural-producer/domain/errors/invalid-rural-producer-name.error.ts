import { DomainError } from './domain.error';

export class InvalidRuralProducerNameError extends DomainError {
  constructor(minLength: number) {
    super(`Name must have at least ${minLength} characters.`);
  }
}
