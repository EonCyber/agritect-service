import { TaxIdType } from '../../../domain/entities/rural-producer';

export class CreateRuralProducerCommand {
  constructor(
    public readonly taxId: string,
    public readonly taxIdType: TaxIdType,
    public readonly name: string,
  ) {}
}
