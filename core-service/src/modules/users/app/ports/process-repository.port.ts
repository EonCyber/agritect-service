import { CommandExecution } from '../../../rural-producer/domain/entities/command-execution';

export interface ProcessRepositoryPort {
  save(execution: CommandExecution): Promise<void>;
  findById(id: string): Promise<CommandExecution | null>;
  update(execution: CommandExecution): Promise<void>;
}
