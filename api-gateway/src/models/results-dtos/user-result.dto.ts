import { IsArray, IsBoolean, IsEmail, IsString, IsUUID } from 'class-validator';

export class UserResultDto {
  @IsUUID()
  id!: string;

  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsBoolean()
  active!: boolean;

  @IsArray()
  @IsString({ each: true })
  roles!: string[];

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;
}
