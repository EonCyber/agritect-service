import { DomainError } from './domain.error';

export class InvalidCropNameError extends DomainError {
  constructor(minLength: number) {
    super(`Crop name must have at least ${minLength} characters.`);
  }
}
