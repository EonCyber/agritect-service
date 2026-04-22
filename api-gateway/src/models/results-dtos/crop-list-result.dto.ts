import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CropListItemDto } from './crop-list-item.dto';

export class CropListResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CropListItemDto)
  items!: CropListItemDto[];
}
