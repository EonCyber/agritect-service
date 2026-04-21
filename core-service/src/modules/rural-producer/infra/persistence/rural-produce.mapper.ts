import { RuralProducer, TaxIdType } from '../../domain/entities/rural-producer';
import { $Enums } from '@prisma/client';
import { FarmMapper } from './farm.mapper';

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

type PrismaRuralProducerWithFarms = {
  id: string;
  taxId: string;
  taxIdType: $Enums.TaxIdType;
  name: string;
  farms: PrismaFarmWithPlantings[];
};

type PrismaRuralProducerScalars = {
  id: string;
  taxId: string;
  taxIdType: $Enums.TaxIdType;
  name: string;
};

export class RuralProducerMapper {
  static toDomain(raw: PrismaRuralProducerWithFarms): RuralProducer {
    const farms = raw.farms.map((f) => FarmMapper.toDomain(f));

    return new RuralProducer(
      raw.id,
      raw.taxId,
      raw.taxIdType as TaxIdType,
      raw.name,
      farms,
    );
  }

  static toPrisma(producer: RuralProducer): PrismaRuralProducerScalars {
    return {
      id: producer.id,
      taxId: producer.taxId,
      taxIdType: producer.taxIdType,
      name: producer.name,
    };
  }
}
