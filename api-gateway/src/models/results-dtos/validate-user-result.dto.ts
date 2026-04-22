import { IsArray, IsBoolean, IsEmail, IsString, IsUUID } from 'class-validator';

/**
 * Internal DTO for authentication flow only.
 * The only result DTO authorized to carry passwordHash.
 * Must NOT be exposed in API responses.
 */
export class ValidateUserResultDto {
  @IsUUID()
  id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  passwordHash!: string;

  @IsArray()
  @IsString({ each: true })
  roles!: string[];

  @IsBoolean()
  active!: boolean;
}
