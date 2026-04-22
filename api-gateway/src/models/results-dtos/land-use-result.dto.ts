import { IsNumber } from 'class-validator';

export class LandUseResultDto {
  @IsNumber()
  agriculturalArea!: number;

  @IsNumber()
  vegetationArea!: number;
}
