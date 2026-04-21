import { Farm } from '../../domain/entities/farm';
import { Planting } from '../../domain/entities/planting';

type PrismaPlanting = {
  id: string;
  farmId: string;
  cropId: string;
  harvestSeasonId: string;
};

type PrismaFarmWithPlantings = {
  id: string;
  ruralProducerId: string;
  name: string;
  city: string;
  state: string;
  totalAreaHectares: number;
  arableAreaHectares: number;
  vegetationAreaHectares: number;
  plantings: PrismaPlanting[];
};

type PrismaFarmScalars = Omit<PrismaFarmWithPlantings, 'plantings'>;

export class FarmMapper {
  static toDomain(raw: PrismaFarmWithPlantings): Farm {
    const plantings = raw.plantings.map(
      (p) => new Planting(p.cropId, p.harvestSeasonId),
    );

    return new Farm(
      raw.id,
      raw.ruralProducerId,
      raw.name,
      raw.city,
      raw.state,
      raw.totalAreaHectares,
      raw.arableAreaHectares,
      raw.vegetationAreaHectares,
      plantings,
    );
  }

  static toPrisma(farm: Farm): PrismaFarmScalars {
    return {
      id: farm.id,
      ruralProducerId: farm.ruralProducerId,
      name: farm.name,
      city: farm.city,
      state: farm.state,
      totalAreaHectares: farm.totalAreaHectares,
      arableAreaHectares: farm.arableAreaHectares,
      vegetationAreaHectares: farm.vegetationAreaHectares,
    };
  }
}
