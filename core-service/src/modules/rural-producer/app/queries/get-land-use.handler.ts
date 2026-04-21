import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetLandUseQuery } from './interfaces/get-land-use.query';
import type { DashboardReadPort, LandUseMetrics } from '../ports/dashboard-read.port';

export const DASHBOARD_READ = 'DASHBOARD_READ';

@QueryHandler(GetLandUseQuery)
export class GetLandUseQueryHandler
  implements IQueryHandler<GetLandUseQuery, LandUseMetrics>
{
  constructor(
    @Inject(DASHBOARD_READ)
    private readonly dashboardRead: DashboardReadPort,
  ) {}

  execute(_query: GetLandUseQuery): Promise<LandUseMetrics> {
    return this.dashboardRead.getLandUse();
  }
}
