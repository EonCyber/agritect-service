import { Farm } from './farm';
import { DuplicateFarmError } from '../errors/duplicate-farm.error';
import { InvalidFarmOwnerError } from '../errors/invalid-farm-owner.error';
import { InvalidRuralProducerNameError } from '../errors/invalid-rural-producer-name.error';
import { InvalidTaxIdError } from '../errors/invalid-tax-id.error';
import { InvalidTaxIdTypeError } from '../errors/invalid-tax-id-type.error';

export enum TaxIdType {
  PF = 'PF',
  PJ = 'PJ',
}
export class RuralProducer {
  private static readonly MIN_NAME_LENGTH = 3;
  private static readonly MIN_CPF_LENGTH = 11;
  private static readonly MIN_CNPJ_LENGTH = 14;

  public readonly id: string;
  public readonly taxId: string;
  public readonly taxIdType: TaxIdType;
  public readonly name: string;
  private _farms: Farm[];

  constructor(
    id: string,
    taxId: string,
    taxIdType: TaxIdType,
    name: string,
    farms: Farm[] = [],
  ) {
    this.validateName(name);
    this.validateTaxId(taxId, taxIdType);

    this.id = id;
    this.taxId = taxId.replace(/\D/g, '');
    this.taxIdType = taxIdType;
    this.name = name.trim();
    this._farms = [...farms];
  }

  get farms(): ReadonlyArray<Farm> {
    return [...this._farms];
  }

  addFarm(farm: Farm): void {
    if (farm.ruralProducerId !== this.id) {
      throw new InvalidFarmOwnerError(farm.id, this.id);
    }

    const duplicate = this._farms.some((f) => f.id === farm.id);
    if (duplicate) {
      throw new DuplicateFarmError(farm.id);
    }

    this._farms.push(farm);
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < RuralProducer.MIN_NAME_LENGTH) {
      throw new InvalidRuralProducerNameError(RuralProducer.MIN_NAME_LENGTH);
    }
  }

  private validateTaxId(taxId: string, taxIdType: TaxIdType): void {
    if (!taxId) {
      throw new InvalidTaxIdError('taxId cannot be empty.');
    }

    if (!Object.values(TaxIdType).includes(taxIdType)) {
      throw new InvalidTaxIdTypeError(Object.values(TaxIdType));
    }

    const digits = taxId.replace(/\D/g, '');
// TODO Adicionar biblioteca de validacao de CPF e CNPJ depois
    if (taxIdType === TaxIdType.PF) {
      if (digits.length !== RuralProducer.MIN_CPF_LENGTH) {
        throw new InvalidTaxIdError(`CPF must have exactly ${RuralProducer.MIN_CPF_LENGTH} digits.`);
      }
    } else {
      if (digits.length !== RuralProducer.MIN_CNPJ_LENGTH) {
        throw new InvalidTaxIdError(`CNPJ must have exactly ${RuralProducer.MIN_CNPJ_LENGTH} digits.`);
      }
    }
  }
}
