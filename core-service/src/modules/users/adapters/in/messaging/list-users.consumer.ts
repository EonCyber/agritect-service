import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { ListUsersQuery } from '../../../app/queries/interfaces/list-users.query';
import type { UserListItem } from '../../../app/ports/user-read.port';
import { EmptyPayloadDto } from './dtos';

@Controller()
export class ListUsersConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'user.list',
    summary: 'Lista todos os usuários cadastrados (sem payload)',
    message: { name: 'EmptyPayload', payload: EmptyPayloadDto },
  })
  @MessagePattern('user.list')
  execute(): Promise<UserListItem[]> {
    return this.queryBus.execute(new ListUsersQuery());
  }
}
