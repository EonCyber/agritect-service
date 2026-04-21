import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { AsyncApiSub } from 'nestjs-asyncapi';
import { GetDashboardMetricsQuery } from '../../../app/queries/interfaces/get-dashboard-metrics.query';
import type { DashboardMetrics } from '../../../app/ports/dashboard-read.port';
import { EmptyPayloadDto } from './dtos';

@Controller()
export class GetDashboardMetricsConsumer {
  constructor(private readonly queryBus: QueryBus) {}

  @AsyncApiSub({
    channel: 'rural-producer.dashboard.metrics',
    summary: 'Retorna as métricas gerais do dashboard (total de fazendas, áreas, etc.) (sem payload)',
    message: { name: 'EmptyPayload', payload: EmptyPayloadDto },
  })
  @MessagePattern('rural-producer.dashboard.metrics')
  execute(): Promise<DashboardMetrics> {
    return this.queryBus.execute(new GetDashboardMetricsQuery());
  }
}
