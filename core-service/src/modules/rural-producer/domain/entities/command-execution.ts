export enum CommandExecutionStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class CommandExecution {
  public readonly id: string;
  public readonly commandName: string;
  public readonly correlationId: string | null;
  public status: CommandExecutionStatus;
  public errorMessage: string | null;
  public readonly createdAt: Date;
  public startedAt: Date | null;
  public completedAt: Date | null;

  constructor(
    id: string,
    commandName: string,
    correlationId: string | null = null,
    status: CommandExecutionStatus = CommandExecutionStatus.PENDING,
    errorMessage: string | null = null,
    createdAt: Date = new Date(),
    startedAt: Date | null = null,
    completedAt: Date | null = null,
  ) {
    this.id = id;
    this.commandName = commandName;
    this.correlationId = correlationId;
    this.status = status;
    this.errorMessage = errorMessage;
    this.createdAt = createdAt;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
  }

  markRunning(): void {
    if (this.status !== CommandExecutionStatus.PENDING) {
      throw new Error(
        `Cannot transition to RUNNING from ${this.status}.`,
      );
    }
    this.status = CommandExecutionStatus.RUNNING;
    this.startedAt = new Date();
  }

  markCompleted(): void {
    if (this.status !== CommandExecutionStatus.RUNNING) {
      throw new Error(
        `Cannot transition to COMPLETED from ${this.status}.`,
      );
    }
    this.status = CommandExecutionStatus.COMPLETED;
    this.completedAt = new Date();
  }

  markFailed(errorMessage: string): void {
    if (
      this.status !== CommandExecutionStatus.RUNNING &&
      this.status !== CommandExecutionStatus.PENDING
    ) {
      throw new Error(
        `Cannot transition to FAILED from ${this.status}.`,
      );
    }
    this.status = CommandExecutionStatus.FAILED;
    this.errorMessage = errorMessage;
    this.completedAt = new Date();
  }
}
