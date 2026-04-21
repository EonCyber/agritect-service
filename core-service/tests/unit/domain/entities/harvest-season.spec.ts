import { HarvestSeason } from '../../../../src/modules/rural-producer/domain/entities/harvest-season';
import { InvalidHarvestSeasonYearError } from '../../../../src/modules/rural-producer/domain/errors';

describe('HarvestSeason', () => {
  describe('constructor', () => {
    it('should create a valid harvest season', () => {
      const hs = new HarvestSeason('hs-1', 2024);

      expect(hs.id).toBe('hs-1');
      expect(hs.year).toBe(2024);
    });

    it('should accept the minimum valid year (1900)', () => {
      expect(() => new HarvestSeason('hs-1', 1900)).not.toThrow();
    });

    it('should accept the maximum valid year (2100)', () => {
      expect(() => new HarvestSeason('hs-1', 2100)).not.toThrow();
    });

    it('should throw InvalidHarvestSeasonYearError for year below 1900', () => {
      expect(() => new HarvestSeason('hs-1', 1899)).toThrow(InvalidHarvestSeasonYearError);
    });

    it('should throw InvalidHarvestSeasonYearError for year above 2100', () => {
      expect(() => new HarvestSeason('hs-1', 2101)).toThrow(InvalidHarvestSeasonYearError);
    });

    it('should throw InvalidHarvestSeasonYearError for a float year', () => {
      expect(() => new HarvestSeason('hs-1', 2024.5)).toThrow(InvalidHarvestSeasonYearError);
    });

    it('should throw InvalidHarvestSeasonYearError for NaN', () => {
      expect(() => new HarvestSeason('hs-1', NaN)).toThrow(InvalidHarvestSeasonYearError);
    });
  });
});
