import { Farm } from '../../../../src/modules/rural-producer/domain/entities/farm';
import { Planting } from '../../../../src/modules/rural-producer/domain/entities/planting';
import {
  InvalidFarmAreaError,
  DuplicatePlantingError,
  PlantingNotFoundError,
} from '../../../../src/modules/rural-producer/domain/errors';

const makeFarm = (overrides: Partial<{
  totalAreaHectares: number;
  arableAreaHectares: number;
  vegetationAreaHectares: number;
}> = {}) =>
  new Farm(
    'farm-1',
    'prod-1',
    'Fazenda Teste',
    'Campinas',
    'SP',
    overrides.totalAreaHectares ?? 100,
    overrides.arableAreaHectares ?? 40,
    overrides.vegetationAreaHectares ?? 30,
  );

describe('Farm', () => {
  describe('constructor', () => {
    it('should create a valid farm', () => {
      const farm = makeFarm();

      expect(farm.id).toBe('farm-1');
      expect(farm.ruralProducerId).toBe('prod-1');
      expect(farm.name).toBe('Fazenda Teste');
      expect(farm.state).toBe('SP');
      expect(farm.totalAreaHectares).toBe(100);
      expect(farm.arableAreaHectares).toBe(40);
      expect(farm.vegetationAreaHectares).toBe(30);
      expect(farm.plantings).toHaveLength(0);
    });

    it('should initialize with provided plantings', () => {
      const plantings = [new Planting('crop-1', 'harvest-1')];
      const farm = new Farm('farm-1', 'prod-1', 'Farm', 'City', 'SP', 100, 40, 30, plantings);

      expect(farm.plantings).toHaveLength(1);
    });

    it('should throw InvalidFarmAreaError when arable area exceeds total', () => {
      expect(() => makeFarm({ totalAreaHectares: 50, arableAreaHectares: 60 })).toThrow(
        InvalidFarmAreaError,
      );
    });

    it('should throw InvalidFarmAreaError when vegetation area exceeds total', () => {
      expect(() => makeFarm({ totalAreaHectares: 50, vegetationAreaHectares: 60 })).toThrow(
        InvalidFarmAreaError,
      );
    });

    it('should throw InvalidFarmAreaError when arable + vegetation exceed total', () => {
      expect(
        () => makeFarm({ totalAreaHectares: 100, arableAreaHectares: 60, vegetationAreaHectares: 50 }),
      ).toThrow(InvalidFarmAreaError);
    });

    it('should accept arable + vegetation exactly equal to total', () => {
      expect(() => makeFarm({ totalAreaHectares: 100, arableAreaHectares: 60, vegetationAreaHectares: 40 })).not.toThrow();
    });
  });

  describe('addPlanting', () => {
    it('should add a new planting', () => {
      const farm = makeFarm();
      farm.addPlanting('crop-1', 'harvest-1');

      expect(farm.plantings).toHaveLength(1);
      expect(farm.plantings[0].cropId).toBe('crop-1');
      expect(farm.plantings[0].harvestSeasonId).toBe('harvest-1');
    });

    it('should add multiple distinct plantings', () => {
      const farm = makeFarm();
      farm.addPlanting('crop-1', 'harvest-1');
      farm.addPlanting('crop-2', 'harvest-1');
      farm.addPlanting('crop-1', 'harvest-2');

      expect(farm.plantings).toHaveLength(3);
    });

    it('should throw DuplicatePlantingError for same crop + harvest combination', () => {
      const farm = makeFarm();
      farm.addPlanting('crop-1', 'harvest-1');

      expect(() => farm.addPlanting('crop-1', 'harvest-1')).toThrow(DuplicatePlantingError);
    });
  });

  describe('removePlanting', () => {
    it('should remove an existing planting', () => {
      const farm = makeFarm();
      farm.addPlanting('crop-1', 'harvest-1');
      farm.removePlanting('crop-1', 'harvest-1');

      expect(farm.plantings).toHaveLength(0);
    });

    it('should only remove the matching planting', () => {
      const farm = makeFarm();
      farm.addPlanting('crop-1', 'harvest-1');
      farm.addPlanting('crop-2', 'harvest-1');
      farm.removePlanting('crop-1', 'harvest-1');

      expect(farm.plantings).toHaveLength(1);
      expect(farm.plantings[0].cropId).toBe('crop-2');
    });

    it('should throw PlantingNotFoundError when planting does not exist', () => {
      const farm = makeFarm();

      expect(() => farm.removePlanting('crop-x', 'harvest-x')).toThrow(PlantingNotFoundError);
    });
  });

  describe('plantings immutability', () => {
    it('should not expose internal plantings array', () => {
      const farm = makeFarm();
      const plantings = farm.plantings as Planting[];
      plantings.push(new Planting('injected', 'injected'));

      expect(farm.plantings).toHaveLength(0);
    });
  });
});
