import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { PlantingDto } from './planting.dto';

export class FarmDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsNumber()
  totalArea!: number;

  @IsNumber()
  agriculturalArea!: number;

  @IsNumber()
  vegetationArea!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlantingDto)
  plantings!: PlantingDto[];
}
