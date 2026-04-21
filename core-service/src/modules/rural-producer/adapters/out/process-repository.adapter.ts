import { Injectable } from '@nestjs/common';
import { CommandExecution } from '../../domain/entities/command-execution';
import { ProcessRepositoryPort } from '../../app/ports/process-repository.port';
import { PrismaCommandExecutionRepository } from '../../infra/persistence/prisma-command-execution.repository';

export const PROCESS_REPOSITORY = 'PROCESS_REPOSITORY';

@Injectable()
export class ProcessRepositoryAdapter implements ProcessRepositoryPort {
  constructor(private readonly repo: PrismaCommandExecutionRepository) {}

  save(execution: CommandExecution): Promise<void> {
    return this.repo.save(execution);
  }

  findById(id: string): Promise<CommandExecution | null> {
    return this.repo.findById(id);
  }

  update(execution: CommandExecution): Promise<void> {
    return this.repo.update(execution);
  }
}
