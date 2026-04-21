import { InvalidHarvestSeasonYearError } from '../errors/invalid-harvest-season-year.error';

export class HarvestSeason {
  private static readonly MIN_YEAR = 1900;
  private static readonly MAX_YEAR = 2100;

  public readonly id: string;
  public readonly year: number;

  constructor(id: string, year: number) {
    this.validateYear(year);
    this.id = id;
    this.year = year;
  }

  private validateYear(year: number): void {
    if (
      !Number.isInteger(year) ||
      year < HarvestSeason.MIN_YEAR ||
      year > HarvestSeason.MAX_YEAR
    ) {
      throw new InvalidHarvestSeasonYearError(year);
    }
  }
}
