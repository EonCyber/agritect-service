import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { GetUserByIdQuery } from '../../../app/queries/interfaces/get-user-by-id.query';
import type { UserReadModel } from '../../../app/ports/user-read.port';
import { GetUserByIdPayloadDto } from './dtos';

@Controller()
export class GetUserByIdConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'user.get',
    summary: 'Retorna os dados de um usuário pelo ID (sem passwordHash)',
    message: {
      name: 'GetUserByIdPayload',
      payload: GetUserByIdPayloadDto,
    },
  })
  @MessagePattern('user.get')
  execute(@Payload() payload: GetUserByIdPayloadDto): Promise<UserReadModel | null> {
    return this.queryBus.execute(new GetUserByIdQuery(payload.id));
  }
}
