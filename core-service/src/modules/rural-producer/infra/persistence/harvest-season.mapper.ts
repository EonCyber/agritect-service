import { HarvestSeason } from '../../domain/entities/harvest-season';

type PrismaHarvestSeason = {
  id: string;
  year: number;
};

export class HarvestSeasonMapper {
  static toDomain(raw: PrismaHarvestSeason): HarvestSeason {
    return new HarvestSeason(raw.id, raw.year);
  }

  static toPrisma(harvestSeason: HarvestSeason): PrismaHarvestSeason {
    return {
      id: harvestSeason.id,
      year: harvestSeason.year,
    };
  }
}
