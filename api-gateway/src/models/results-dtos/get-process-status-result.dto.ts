import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CommandExecutionStatus } from './command-execution-result.dto';

export class GetProcessStatusResultDto {
  @IsString()
  processId!: string;

  @IsEnum(CommandExecutionStatus)
  status!: CommandExecutionStatus;

  @IsOptional()
  @IsString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  error?: string;
}
