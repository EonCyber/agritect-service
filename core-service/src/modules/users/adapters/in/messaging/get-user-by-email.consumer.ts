import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { GetUserByEmailQuery } from '../../../app/queries/interfaces/get-user-by-email.query';
import type { UserReadModel } from '../../../app/ports/user-read.port';
import { GetUserByEmailPayloadDto } from './dtos';

@Controller()
export class GetUserByEmailConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'user.get-by-email',
    summary: 'Retorna os dados de um usuário pelo e-mail (sem passwordHash)',
    message: {
      name: 'GetUserByEmailPayload',
      payload: GetUserByEmailPayloadDto,
    },
  })
  @MessagePattern('user.get-by-email')
  execute(@Payload() payload: GetUserByEmailPayloadDto): Promise<UserReadModel | null> {
    return this.queryBus.execute(new GetUserByEmailQuery(payload.email));
  }
}
