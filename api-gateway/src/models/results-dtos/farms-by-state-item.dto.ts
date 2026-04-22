import { IsNumber, IsString } from 'class-validator';

export class FarmsByStateItemDto {
  @IsString()
  state!: string;

  @IsNumber()
  count!: number;
}
