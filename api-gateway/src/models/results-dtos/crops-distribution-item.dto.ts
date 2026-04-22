import { IsNumber, IsString } from 'class-validator';

export class CropsDistributionItemDto {
  @IsString()
  crop!: string;

  @IsNumber()
  area!: number;
}
