import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { GetProcessStatusQuery } from '../../../app/queries/interfaces/get-process-status.query';
import type { CommandExecution } from '../../../domain/entities/command-execution';
import { GetProcessStatusPayloadDto } from './dtos';

@Controller()
export class GetProcessStatusConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.process.status',
    summary: 'Consulta o status de execução de um comando assíncrono pelo processId',
    message: {
      name: 'GetProcessStatusPayload',
      payload: GetProcessStatusPayloadDto,
    },
  })
  @MessagePattern('rural-producer.process.status')
  execute(
    @Payload() payload: GetProcessStatusPayloadDto,
  ): Promise<CommandExecution | null> {
    return this.queryBus.execute(new GetProcessStatusQuery(payload.processId));
  }
}
