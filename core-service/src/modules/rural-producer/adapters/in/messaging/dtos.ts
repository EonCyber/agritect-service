import { ApiProperty } from '@nestjs/swagger';
import { TaxIdType } from '../../../domain/entities/rural-producer';

export class CreateRuralProducerPayloadDto {
  @ApiProperty({ description: 'CPF (11 dígitos) ou CNPJ (14 dígitos) sem formatação' })
  taxId!: string;

  @ApiProperty({ enum: TaxIdType, description: 'Tipo do documento fiscal (PF = CPF, PJ = CNPJ)' })
  taxIdType!: TaxIdType;

  @ApiProperty({ description: 'Nome completo do produtor rural' })
  name!: string;
}

export class UpdateRuralProducerPayloadDto {
  @ApiProperty({ description: 'UUID do produtor rural' })
  id!: string;

  @ApiProperty({ description: 'Novo nome do produtor rural' })
  name!: string;
}

export class DeleteRuralProducerPayloadDto {
  @ApiProperty({ description: 'UUID do produtor rural a ser removido' })
  id!: string;
}

export class AddPlantingPayloadDto {
  @ApiProperty({ description: 'UUID do produtor rural' })
  ruralProducerId!: string;

  @ApiProperty({ description: 'UUID da fazenda' })
  farmId!: string;

  @ApiProperty({ description: 'UUID da cultura agrícola' })
  cropId!: string;

  @ApiProperty({ description: 'UUID da safra' })
  harvestSeasonId!: string;
}

export class RemovePlantingPayloadDto {
  @ApiProperty({ description: 'UUID do produtor rural' })
  ruralProducerId!: string;

  @ApiProperty({ description: 'UUID da fazenda' })
  farmId!: string;

  @ApiProperty({ description: 'UUID da cultura agrícola' })
  cropId!: string;

  @ApiProperty({ description: 'UUID da safra' })
  harvestSeasonId!: string;
}

export class GetRuralProducerPayloadDto {
  @ApiProperty({ description: 'UUID do produtor rural' })
  id!: string;
}

export class GetProcessStatusPayloadDto {
  @ApiProperty({ description: 'UUID do processo (CommandExecution) retornado ao disparar um comando' })
  processId!: string;
}

export class EmptyPayloadDto {}
