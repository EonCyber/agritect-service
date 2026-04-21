import { Test, TestingModule } from '@nestjs/testing';
import {
  GetDashboardMetricsQueryHandler,
  DASHBOARD_READ,
} from '../../../../src/modules/rural-producer/app/queries/get-dashboard-metrics.handler';
import { GetDashboardMetricsQuery } from '../../../../src/modules/rural-producer/app/queries/interfaces/get-dashboard-metrics.query';
import type { DashboardMetrics } from '../../../../src/modules/rural-producer/app/ports/dashboard-read.port';

describe('GetDashboardMetricsQueryHandler', () => {
  let handler: GetDashboardMetricsQueryHandler;
  const mockDashboardRead = {
    getMetrics: jest.fn(),
    getFarmsByState: jest.fn(),
    getCropsDistribution: jest.fn(),
    getLandUse: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDashboardMetricsQueryHandler,
        { provide: DASHBOARD_READ, useValue: mockDashboardRead },
      ],
    }).compile();

    handler = module.get(GetDashboardMetricsQueryHandler);
  });

  it('should return dashboard metrics', async () => {
    const metrics: DashboardMetrics = { totalFarms: 10, totalHectares: 500 };
    mockDashboardRead.getMetrics.mockResolvedValue(metrics);

    const result = await handler.execute(new GetDashboardMetricsQuery());

    expect(mockDashboardRead.getMetrics).toHaveBeenCalledTimes(1);
    expect(result).toBe(metrics);
  });

  it('should return zero values when there is no data', async () => {
    const metrics: DashboardMetrics = { totalFarms: 0, totalHectares: 0 };
    mockDashboardRead.getMetrics.mockResolvedValue(metrics);

    const result = await handler.execute(new GetDashboardMetricsQuery());

    expect(result.totalFarms).toBe(0);
    expect(result.totalHectares).toBe(0);
  });

  it('should propagate errors from the read port', async () => {
    mockDashboardRead.getMetrics.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetDashboardMetricsQuery())).rejects.toThrow('DB error');
  });
});
