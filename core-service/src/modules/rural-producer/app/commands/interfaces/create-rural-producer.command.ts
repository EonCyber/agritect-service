import { TaxIdType } from '../../../domain/entities/rural-producer';

export class CreateRuralProducerCommand {
  constructor(
    public readonly id: string,
    public readonly taxId: string,
    public readonly taxIdType: TaxIdType,
    public readonly name: string,
  ) {}
}
