import { IsString, IsUUID } from 'class-validator';

export class CropListItemDto {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;
}
