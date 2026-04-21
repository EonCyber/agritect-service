import { DomainError } from './domain.error';

export class DuplicatePlantingError extends DomainError {
  constructor(cropId: string, harvestSeasonId: string) {
    super(
      `Planting for crop ${cropId} in harvest season ${harvestSeasonId} already exists in this farm.`,
    );
  }
}
