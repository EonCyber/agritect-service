export class CreateRuralProducerPayloadDto {
  taxId!: string;
  taxIdType!: 'PF' | 'PJ';
  name!: string;
}
