import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListUsersQuery } from './interfaces/list-users.query';
import type { UserReadPort, UserListItem } from '../ports/user-read.port';

export const USER_READ = 'USER_READ';

@QueryHandler(ListUsersQuery)
export class ListUsersQueryHandler
  implements IQueryHandler<ListUsersQuery, UserListItem[]>
{
  constructor(
    @Inject(USER_READ)
    private readonly readPort: UserReadPort,
  ) {}

  execute(_query: ListUsersQuery): Promise<UserListItem[]> {
    return this.readPort.list();
  }
}
