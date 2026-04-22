import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class RemovePlantingRequestDto {
  @ApiProperty()
  @IsUUID()
  farmId!: string;

  @ApiProperty()
  @IsUUID()
  cropId!: string;

  @ApiProperty()
  @IsUUID()
  harvestSeasonId!: string;
}
