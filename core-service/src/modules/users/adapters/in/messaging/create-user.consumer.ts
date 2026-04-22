import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { CreateUserCommand } from '../../../app/commands/interfaces/create-user.command';
import type { CommandExecutionResult } from '../../../app/commands/create-user.handler';
import { CreateUserPayloadDto } from './dtos';

@Controller()
export class CreateUserConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @AsyncApiSub({
    channel: 'user.create',
    summary: 'Cria um novo usuário',
    message: {
      name: 'CreateUserPayload',
      payload: CreateUserPayloadDto,
    },
  })
  @MessagePattern('user.create')
  execute(@Payload() payload: CreateUserPayloadDto): Promise<CommandExecutionResult> {
    return this.commandBus.execute(
      new CreateUserCommand(
        payload.username,
        payload.email,
        payload.password,
        payload.roles ?? ['user'],
      ),
    );
  }
}
