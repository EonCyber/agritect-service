import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCropsDistributionQuery } from './interfaces/get-crops-distribution.query';
import type { DashboardReadPort, CropsDistributionItem } from '../ports/dashboard-read.port';

export const DASHBOARD_READ = 'DASHBOARD_READ';

@QueryHandler(GetCropsDistributionQuery)
export class GetCropsDistributionQueryHandler
  implements IQueryHandler<GetCropsDistributionQuery, CropsDistributionItem[]>
{
  constructor(
    @Inject(DASHBOARD_READ)
    private readonly dashboardRead: DashboardReadPort,
  ) {}

  execute(_query: GetCropsDistributionQuery): Promise<CropsDistributionItem[]> {
    return this.dashboardRead.getCropsDistribution();
  }
}
