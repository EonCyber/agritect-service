import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetDashboardMetricsQuery } from './interfaces/get-dashboard-metrics.query';
import type { DashboardReadPort, DashboardMetrics } from '../ports/dashboard-read.port';

export const DASHBOARD_READ = 'DASHBOARD_READ';

@QueryHandler(GetDashboardMetricsQuery)
export class GetDashboardMetricsQueryHandler
  implements IQueryHandler<GetDashboardMetricsQuery, DashboardMetrics>
{
  constructor(
    @Inject(DASHBOARD_READ)
    private readonly dashboardRead: DashboardReadPort,
  ) {}

  execute(_query: GetDashboardMetricsQuery): Promise<DashboardMetrics> {
    return this.dashboardRead.getMetrics();
  }
}
