import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { ValidateUserCommand } from '../../../app/commands/interfaces/validate-user.command';
import type { UserValidationResult } from '../../../app/commands/validate-user.handler';
import { ValidateUserPayloadDto } from './dtos';

@Controller()
export class ValidateUserConsumer {
  private readonly logger = new Logger(ValidateUserConsumer.name);

  constructor(private readonly commandBus: CommandBus) {}

  @AsyncApiSub({
    channel: 'user.validate',
    summary: 'Retorna dados de credenciais do usuário para validação de autenticação',
    message: {
      name: 'ValidateUserPayload',
      payload: ValidateUserPayloadDto,
    },
  })
  @MessagePattern('user.validate')
  execute(@Payload() payload: ValidateUserPayloadDto): Promise<UserValidationResult | null> {
    this.logger.debug(`Received payload: ${JSON.stringify(payload)}`);
    this.logger.debug(`Payload type: ${typeof payload}, email: ${payload?.email}, password: ${payload?.password}`);
    
    if (!payload.email || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
      throw new Error('Email is required for user validation');
    }
    if (!payload.password || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
      throw new Error('Password is required for user validation');
    }
    return this.commandBus.execute(new ValidateUserCommand(payload.email, payload.password));
  }
}
