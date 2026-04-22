import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { UserResultDto } from './user-result.dto';

export class ListUsersResultDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserResultDto)
  items!: UserResultDto[];
}
