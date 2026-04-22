import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { GetRuralProducerResultDto } from './get-rural-producer-result.dto';

export class ListRuralProducersResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetRuralProducerResultDto)
  items!: GetRuralProducerResultDto[];
}
