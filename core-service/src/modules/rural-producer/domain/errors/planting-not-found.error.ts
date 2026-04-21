import { DomainError } from './domain.error';

export class PlantingNotFoundError extends DomainError {
  constructor(cropId: string, harvestSeasonId: string) {
    super(
      `Planting for crop ${cropId} in harvest season ${harvestSeasonId} not found in this farm.`,
    );
  }
}
