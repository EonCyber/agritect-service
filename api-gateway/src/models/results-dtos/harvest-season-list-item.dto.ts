import { IsString, IsUUID } from 'class-validator';

export class HarvestSeasonListItemDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;
}
