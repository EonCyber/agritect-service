import { IsEnum, IsString } from 'class-validator';

export enum CommandExecutionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class CommandExecutionResultDto {
  @IsString()
  processId!: string;

  @IsEnum(CommandExecutionStatus)
  status!: CommandExecutionStatus;

  @IsString()
  createdAt!: string;
}
