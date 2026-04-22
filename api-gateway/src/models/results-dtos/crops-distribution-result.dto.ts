import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CropsDistributionItemDto } from './crops-distribution-item.dto';

export class CropsDistributionResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CropsDistributionItemDto)
  items!: CropsDistributionItemDto[];
}
