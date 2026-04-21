import { DomainError } from './domain.error';

export class HarvestSeasonNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Harvest season with id "${id}" not found.`);
  }
}
