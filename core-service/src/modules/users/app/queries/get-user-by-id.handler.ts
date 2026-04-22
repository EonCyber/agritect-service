import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserByIdQuery } from './interfaces/get-user-by-id.query';
import type { UserReadPort, UserReadModel } from '../ports/user-read.port';

export const USER_READ = 'USER_READ';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler
  implements IQueryHandler<GetUserByIdQuery, UserReadModel | null>
{
  constructor(
    @Inject(USER_READ)
    private readonly readPort: UserReadPort,
  ) {}

  execute(query: GetUserByIdQuery): Promise<UserReadModel | null> {
    return this.readPort.findById(query.id);
  }
}
