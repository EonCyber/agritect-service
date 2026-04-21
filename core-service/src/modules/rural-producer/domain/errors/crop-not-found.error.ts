import { DomainError } from './domain.error';

export class CropNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Crop with id "${id}" not found.`);
  }
}
