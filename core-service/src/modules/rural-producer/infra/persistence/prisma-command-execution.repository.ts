import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma.service';
import { CommandExecution, CommandExecutionStatus } from '../../domain/entities/command-execution';
import { $Enums } from '@prisma/client';

@Injectable()
export class PrismaCommandExecutionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(execution: CommandExecution): Promise<void> {
    await this.prisma.commandExecution.create({
      data: {
        id: execution.id,
        commandName: execution.commandName,
        correlationId: execution.correlationId,
        status: execution.status as unknown as $Enums.CommandExecutionStatus,
        errorMessage: execution.errorMessage,
        createdAt: execution.createdAt,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
      },
    });
  }

  async findById(id: string): Promise<CommandExecution | null> {
    const row = await this.prisma.commandExecution.findUnique({ where: { id } });
    if (!row) return null;
    return new CommandExecution(
      row.id,
      row.commandName,
      row.correlationId,
      row.status as unknown as CommandExecutionStatus,
      row.errorMessage,
      row.createdAt,
      row.startedAt,
      row.completedAt,
    );
  }

  async update(execution: CommandExecution): Promise<void> {
    await this.prisma.commandExecution.update({
      where: { id: execution.id },
      data: {
        status: execution.status as unknown as $Enums.CommandExecutionStatus,
        errorMessage: execution.errorMessage,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
      },
    });
  }
}
