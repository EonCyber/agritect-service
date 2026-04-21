import { HarvestSeason } from '../../domain/entities/harvest-season';

export interface HarvestSeasonRepositoryPort {
  save(harvestSeason: HarvestSeason): Promise<void>;
  findById(id: string): Promise<HarvestSeason | null>;
  list(): Promise<HarvestSeason[]>;
  delete(id: string): Promise<void>;
}
