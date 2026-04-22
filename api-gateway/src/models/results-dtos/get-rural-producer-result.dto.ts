import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsString, IsUUID, ValidateNested } from 'class-validator';
import { FarmDto } from './farm.dto';

export enum TaxIdType {
  PF = 'PF',
  PJ = 'PJ',
}

export class GetRuralProducerResultDto {
  @IsUUID()
  id!: string;

  @IsString()
  taxId!: string;

  @IsEnum(TaxIdType)
  taxIdType!: TaxIdType;

  @IsString()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FarmDto)
  farms!: FarmDto[];
}
