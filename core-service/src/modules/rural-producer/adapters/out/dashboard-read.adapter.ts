import { Injectable } from '@nestjs/common';
import {
  DashboardReadPort,
  DashboardMetrics,
  FarmsByStateItem,
  CropsDistributionItem,
  LandUseMetrics,
} from '../../app/ports/dashboard-read.port';
import { PrismaDashboardRepository } from '../../infra/persistence/prisma-dashboard.repository';

export const DASHBOARD_READ = 'DASHBOARD_READ';

@Injectable()
export class DashboardReadAdapter implements DashboardReadPort {
  constructor(private readonly repo: PrismaDashboardRepository) {}

  getMetrics(): Promise<DashboardMetrics> {
    return this.repo.getMetrics();
  }

  getFarmsByState(): Promise<FarmsByStateItem[]> {
    return this.repo.getFarmsByState();
  }

  getCropsDistribution(): Promise<CropsDistributionItem[]> {
    return this.repo.getCropsDistribution();
  }

  getLandUse(): Promise<LandUseMetrics> {
    return this.repo.getLandUse();
  }
}
