import { Planting } from '../../domain/entities/planting';

type PrismaPlanting = {
  id: string;
  farmId: string;
  cropId: string;
  harvestSeasonId: string;
};

type PrismaPlantingCreateInput = {
  farmId: string;
  cropId: string;
  harvestSeasonId: string;
};

export class PlantingMapper {
  static toDomain(raw: PrismaPlanting): Planting {
    return new Planting(raw.cropId, raw.harvestSeasonId);
  }

  static toPrisma(planting: Planting, farmId: string): PrismaPlantingCreateInput {
    return {
      farmId,
      cropId: planting.cropId,
      harvestSeasonId: planting.harvestSeasonId,
    };
  }
}
