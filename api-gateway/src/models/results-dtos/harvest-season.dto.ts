import { IsString, IsUUID } from 'class-validator';

export class HarvestSeasonDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;
}
