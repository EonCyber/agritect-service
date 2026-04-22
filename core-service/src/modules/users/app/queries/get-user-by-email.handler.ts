import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUserByEmailQuery } from './interfaces/get-user-by-email.query';
import type { UserReadPort, UserReadModel } from '../ports/user-read.port';

export const USER_READ = 'USER_READ';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailQueryHandler
  implements IQueryHandler<GetUserByEmailQuery, UserReadModel | null>
{
  constructor(
    @Inject(USER_READ)
    private readonly readPort: UserReadPort,
  ) {}

  execute(query: GetUserByEmailQuery): Promise<UserReadModel | null> {
    return this.readPort.findByEmail(query.email);
  }
}
