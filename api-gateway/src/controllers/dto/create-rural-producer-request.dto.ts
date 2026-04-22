import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TaxIdTypeEnum {
  PF = 'PF',
  PJ = 'PJ',
}

export class CreateRuralProducerRequestDto {
  @ApiProperty()
  @IsString()
  taxId!: string;

  @ApiProperty({ enum: TaxIdTypeEnum })
  @IsEnum(TaxIdTypeEnum)
  taxIdType!: 'PF' | 'PJ';

  @ApiProperty()
  @IsString()
  name!: string;
}
