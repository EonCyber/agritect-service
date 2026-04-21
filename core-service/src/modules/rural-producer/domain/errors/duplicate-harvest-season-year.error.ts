import { DomainError } from './domain.error';

export class DuplicateHarvestSeasonYearError extends DomainError {
  constructor(year: number) {
    super(`A harvest season for year ${year} already exists.`);
  }
}
