import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { HarvestSeasonListItemDto } from './harvest-season-list-item.dto';

export class HarvestSeasonListResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HarvestSeasonListItemDto)
  items!: HarvestSeasonListItemDto[];
}
