import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProcessStatusQuery } from './interfaces/get-process-status.query';
import type { ProcessRepositoryPort } from '../ports/process-repository.port';
import type { CommandExecution } from '../../domain/entities/command-execution';

export const PROCESS_REPOSITORY = 'PROCESS_REPOSITORY';

@QueryHandler(GetProcessStatusQuery)
export class GetProcessStatusQueryHandler
  implements IQueryHandler<GetProcessStatusQuery, CommandExecution | null>
{
  constructor(
    @Inject(PROCESS_REPOSITORY)
    private readonly processRepository: ProcessRepositoryPort,
  ) {}

  execute(query: GetProcessStatusQuery): Promise<CommandExecution | null> {
    return this.processRepository.findById(query.processId);
  }
}
