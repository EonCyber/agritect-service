import { Planting } from '../../../../src/modules/rural-producer/domain/entities/planting';

describe('Planting', () => {
  it('should store cropId and harvestSeasonId', () => {
    const planting = new Planting('crop-1', 'harvest-1');

    expect(planting.cropId).toBe('crop-1');
    expect(planting.harvestSeasonId).toBe('harvest-1');
  });

  it('should create distinct instances for different values', () => {
    const a = new Planting('crop-1', 'harvest-1');
    const b = new Planting('crop-2', 'harvest-2');

    expect(a.cropId).not.toBe(b.cropId);
    expect(a.harvestSeasonId).not.toBe(b.harvestSeasonId);
  });
});
