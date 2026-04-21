import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetFarmsByStateQuery } from './interfaces/get-farms-by-state.query';
import type { DashboardReadPort, FarmsByStateItem } from '../ports/dashboard-read.port';

export const DASHBOARD_READ = 'DASHBOARD_READ';

@QueryHandler(GetFarmsByStateQuery)
export class GetFarmsByStateQueryHandler
  implements IQueryHandler<GetFarmsByStateQuery, FarmsByStateItem[]>
{
  constructor(
    @Inject(DASHBOARD_READ)
    private readonly dashboardRead: DashboardReadPort,
  ) {}

  execute(_query: GetFarmsByStateQuery): Promise<FarmsByStateItem[]> {
    return this.dashboardRead.getFarmsByState();
  }
}
