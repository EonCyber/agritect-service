import { IsString, IsUUID } from 'class-validator';

export class CropDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;
}
