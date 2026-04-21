import { Planting } from './planting';
import { DuplicatePlantingError } from '../errors/duplicate-planting.error';
import { InvalidFarmAreaError } from '../errors/invalid-farm-area.error';
import { PlantingNotFoundError } from '../errors/planting-not-found.error';

export class Farm {
  private _plantings: Planting[];

  constructor(
    public readonly id: string,
    public readonly ruralProducerId: string,
    public readonly name: string,
    public readonly city: string,
    public readonly state: string,
    public readonly totalAreaHectares: number,
    public readonly arableAreaHectares: number,
    public readonly vegetationAreaHectares: number,
    plantings: Planting[] = [],
  ) {
    this.validateAreas(totalAreaHectares, arableAreaHectares, vegetationAreaHectares);
    this._plantings = [...plantings];
  }

  get plantings(): ReadonlyArray<Planting> {
    return [...this._plantings];
  }

  addPlanting(cropId: string, harvestSeasonId: string): void {
    this.validateNoDuplicatePlanting(cropId, harvestSeasonId);
    this._plantings.push(new Planting(cropId, harvestSeasonId));
  }

  removePlanting(cropId: string, harvestSeasonId: string): void {
    const index = this._plantings.findIndex(
      (p) => p.cropId === cropId && p.harvestSeasonId === harvestSeasonId,
    );

    if (index === -1) {
      throw new PlantingNotFoundError(cropId, harvestSeasonId);
    }

    this._plantings.splice(index, 1);
  }

  private validateAreas(
    total: number,
    arable: number,
    vegetation: number,
  ): void {
    if (arable > total) {
      throw new InvalidFarmAreaError('Arable area cannot be greater than total area.');
    }
    if (vegetation > total) {
      throw new InvalidFarmAreaError('Vegetation area cannot be greater than total area.');
    }
    if (arable + vegetation > total) {
      throw new InvalidFarmAreaError('Sum of arable and vegetation areas cannot exceed total area.');
    }
  }

  private validateNoDuplicatePlanting(cropId: string, harvestSeasonId: string): void {
    const duplicate = this._plantings.some(
      (p) => p.cropId === cropId && p.harvestSeasonId === harvestSeasonId,
    );

    if (duplicate) {
      throw new DuplicatePlantingError(cropId, harvestSeasonId);
    }
  }
}
