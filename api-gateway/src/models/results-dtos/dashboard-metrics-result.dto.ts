import { IsNumber } from 'class-validator';

export class DashboardMetricsResultDto {
  @IsNumber()
  totalFarms!: number;

  @IsNumber()
  totalHectares!: number;

  @IsNumber()
  totalAgriculturalArea!: number;

  @IsNumber()
  totalVegetationArea!: number;
}
