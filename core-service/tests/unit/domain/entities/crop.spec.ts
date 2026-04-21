import { Crop } from '../../../../src/modules/rural-producer/domain/entities/crop';
import { InvalidCropNameError } from '../../../../src/modules/rural-producer/domain/errors';

describe('Crop', () => {
  describe('constructor', () => {
    it('should create a valid crop', () => {
      const crop = new Crop('crop-1', 'Soja');

      expect(crop.id).toBe('crop-1');
      expect(crop.name).toBe('Soja');
    });

    it('should trim whitespace from name', () => {
      const crop = new Crop('crop-1', '  Milho  ');

      expect(crop.name).toBe('Milho');
    });

    it('should accept minimum valid name (2 chars)', () => {
      expect(() => new Crop('crop-1', 'Ab')).not.toThrow();
    });

    it('should throw InvalidCropNameError for name with 1 char', () => {
      expect(() => new Crop('crop-1', 'A')).toThrow(InvalidCropNameError);
    });

    it('should throw InvalidCropNameError for empty name', () => {
      expect(() => new Crop('crop-1', '')).toThrow(InvalidCropNameError);
    });

    it('should throw InvalidCropNameError for whitespace-only name', () => {
      expect(() => new Crop('crop-1', '   ')).toThrow(InvalidCropNameError);
    });
  });
});
