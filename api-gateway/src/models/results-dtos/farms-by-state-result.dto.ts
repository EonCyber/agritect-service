import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { FarmsByStateItemDto } from './farms-by-state-item.dto';

export class FarmsByStateResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FarmsByStateItemDto)
  items!: FarmsByStateItemDto[];
}
