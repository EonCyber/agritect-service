import { TaxIdType } from '../../domain/entities/rural-producer';

export interface PlantingReadModel {
  cropId: string;
  cropName: string;
  harvestSeasonId: string;
  harvestSeasonYear: number;
}

export interface FarmReadModel {
  id: string;
  name: string;
  city: string;
  state: string;
  totalAreaHectares: number;
  arableAreaHectares: number;
  vegetationAreaHectares: number;
  plantings: PlantingReadModel[];
}

export interface RuralProducerReadModel {
  id: string;
  taxId: string;
  taxIdType: TaxIdType;
  name: string;
  farms: FarmReadModel[];
}

export interface RuralProducerListItem {
  id: string;
  name: string;
  taxId: string;
  farmsCount: number;
}

export interface RuralProducerReadPort {
  findById(id: string): Promise<RuralProducerReadModel | null>;
  list(): Promise<RuralProducerListItem[]>;
}
