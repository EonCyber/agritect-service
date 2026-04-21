import { RuralProducer, TaxIdType } from '../../../../src/modules/rural-producer/domain/entities/rural-producer';
import { Farm } from '../../../../src/modules/rural-producer/domain/entities/farm';
import {
  InvalidRuralProducerNameError,
  InvalidTaxIdError,
  InvalidTaxIdTypeError,
  InvalidFarmOwnerError,
  DuplicateFarmError,
} from '../../../../src/modules/rural-producer/domain/errors';

const makeFarm = (id: string, producerId: string) =>
  new Farm(id, producerId, 'Farm', 'City', 'SP', 100, 40, 30);

describe('RuralProducer', () => {
  describe('constructor', () => {
    it('should create a valid PF producer', () => {
      const producer = new RuralProducer('id-1', '12345678901', TaxIdType.PF, 'João da Silva');

      expect(producer.id).toBe('id-1');
      expect(producer.taxId).toBe('12345678901');
      expect(producer.taxIdType).toBe(TaxIdType.PF);
      expect(producer.name).toBe('João da Silva');
      expect(producer.farms).toHaveLength(0);
    });

    it('should create a valid PJ producer', () => {
      const producer = new RuralProducer('id-2', '12345678000195', TaxIdType.PJ, 'Empresa SA');

      expect(producer.taxId).toBe('12345678000195');
      expect(producer.taxIdType).toBe(TaxIdType.PJ);
    });

    it('should strip non-digits from taxId', () => {
      const producer = new RuralProducer('id-3', '123.456.789-01', TaxIdType.PF, 'João da Silva');

      expect(producer.taxId).toBe('12345678901');
    });

    it('should trim whitespace from name', () => {
      const producer = new RuralProducer('id-4', '12345678901', TaxIdType.PF, '  João  ');

      expect(producer.name).toBe('João');
    });

    it('should initialize with provided farms', () => {
      const farm = makeFarm('farm-1', 'id-5');
      const producer = new RuralProducer('id-5', '12345678901', TaxIdType.PF, 'João', [farm]);

      expect(producer.farms).toHaveLength(1);
    });

    it('should throw InvalidRuralProducerNameError for name too short', () => {
      expect(() => new RuralProducer('id-6', '12345678901', TaxIdType.PF, 'Jo')).toThrow(
        InvalidRuralProducerNameError,
      );
    });

    it('should throw InvalidRuralProducerNameError for empty name', () => {
      expect(() => new RuralProducer('id-7', '12345678901', TaxIdType.PF, '')).toThrow(
        InvalidRuralProducerNameError,
      );
    });

    it('should throw InvalidTaxIdError for CPF with wrong digit count', () => {
      expect(() => new RuralProducer('id-8', '123456789', TaxIdType.PF, 'João da Silva')).toThrow(
        InvalidTaxIdError,
      );
    });

    it('should throw InvalidTaxIdError for CNPJ with wrong digit count', () => {
      expect(() => new RuralProducer('id-9', '1234567800019', TaxIdType.PJ, 'Empresa SA')).toThrow(
        InvalidTaxIdError,
      );
    });

    it('should throw InvalidTaxIdError for empty taxId', () => {
      expect(() => new RuralProducer('id-10', '', TaxIdType.PF, 'João da Silva')).toThrow(
        InvalidTaxIdError,
      );
    });

    it('should throw InvalidTaxIdTypeError for unrecognised taxIdType', () => {
      expect(
        () => new RuralProducer('id-11', '12345678901', 'XX' as TaxIdType, 'João da Silva'),
      ).toThrow(InvalidTaxIdTypeError);
    });
  });

  describe('addFarm', () => {
    it('should add a farm that belongs to the producer', () => {
      const producer = new RuralProducer('prod-1', '12345678901', TaxIdType.PF, 'João da Silva');
      const farm = makeFarm('farm-1', 'prod-1');

      producer.addFarm(farm);

      expect(producer.farms).toHaveLength(1);
      expect(producer.farms[0]).toBe(farm);
    });

    it('should throw InvalidFarmOwnerError when farm belongs to another producer', () => {
      const producer = new RuralProducer('prod-1', '12345678901', TaxIdType.PF, 'João da Silva');
      const farm = makeFarm('farm-1', 'other-producer');

      expect(() => producer.addFarm(farm)).toThrow(InvalidFarmOwnerError);
    });

    it('should throw DuplicateFarmError when adding the same farm twice', () => {
      const producer = new RuralProducer('prod-1', '12345678901', TaxIdType.PF, 'João da Silva');
      const farm = makeFarm('farm-1', 'prod-1');
      producer.addFarm(farm);

      expect(() => producer.addFarm(farm)).toThrow(DuplicateFarmError);
    });

    it('should add multiple distinct farms', () => {
      const producer = new RuralProducer('prod-1', '12345678901', TaxIdType.PF, 'João da Silva');
      producer.addFarm(makeFarm('farm-1', 'prod-1'));
      producer.addFarm(makeFarm('farm-2', 'prod-1'));

      expect(producer.farms).toHaveLength(2);
    });
  });

  describe('farms immutability', () => {
    it('should return a readonly array that does not expose internal state', () => {
      const producer = new RuralProducer('prod-1', '12345678901', TaxIdType.PF, 'João da Silva');
      const farms = producer.farms as Farm[];
      farms.push(makeFarm('injected', 'prod-1'));

      expect(producer.farms).toHaveLength(0);
    });
  });
});
