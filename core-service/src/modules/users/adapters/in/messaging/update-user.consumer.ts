import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { UpdateUserCommand } from '../../../app/commands/interfaces/update-user.command';
import type { CommandExecutionResult } from '../../../app/commands/create-user.handler';
import { UpdateUserPayloadDto } from './dtos';

@Controller()
export class UpdateUserConsumer {
  constructor(private readonly commandBus: CommandBus) {}

  @AsyncApiSub({
    channel: 'user.update',
    summary: 'Atualiza dados de um usuário existente',
    message: {
      name: 'UpdateUserPayload',
      payload: UpdateUserPayloadDto,
    },
  })
  @MessagePattern('user.update')
  execute(@Payload() payload: UpdateUserPayloadDto): Promise<CommandExecutionResult> {
    return this.commandBus.execute(
      new UpdateUserCommand(payload.id, payload.username, payload.active, payload.roles),
    );
  }
}
