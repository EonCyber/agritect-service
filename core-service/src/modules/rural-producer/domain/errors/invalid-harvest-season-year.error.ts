import { DomainError } from './domain.error';

export class InvalidHarvestSeasonYearError extends DomainError {
  constructor(year: number) {
    super(`Invalid harvest season year: ${year}. Year must be a positive integer between 1900 and 2100.`);
  }
}
