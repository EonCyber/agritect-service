import { Test, TestingModule } from '@nestjs/testing';
import {
  GetCropsDistributionQueryHandler,
  DASHBOARD_READ,
} from '../../../../src/modules/rural-producer/app/queries/get-crops-distribution.handler';
import { GetCropsDistributionQuery } from '../../../../src/modules/rural-producer/app/queries/interfaces/get-crops-distribution.query';
import type { CropsDistributionItem } from '../../../../src/modules/rural-producer/app/ports/dashboard-read.port';

describe('GetCropsDistributionQueryHandler', () => {
  let handler: GetCropsDistributionQueryHandler;
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
        GetCropsDistributionQueryHandler,
        { provide: DASHBOARD_READ, useValue: mockDashboardRead },
      ],
    }).compile();

    handler = module.get(GetCropsDistributionQueryHandler);
  });

  it('should return crops distribution', async () => {
    const items: CropsDistributionItem[] = [
      { cropId: 'crop-1', cropName: 'Soja', plantingsCount: 10 },
      { cropId: 'crop-2', cropName: 'Milho', plantingsCount: 7 },
    ];
    mockDashboardRead.getCropsDistribution.mockResolvedValue(items);

    const result = await handler.execute(new GetCropsDistributionQuery());

    expect(mockDashboardRead.getCropsDistribution).toHaveBeenCalledTimes(1);
    expect(result).toBe(items);
    expect(result).toHaveLength(2);
  });

  it('should return an empty array when there are no plantings', async () => {
    mockDashboardRead.getCropsDistribution.mockResolvedValue([]);

    const result = await handler.execute(new GetCropsDistributionQuery());

    expect(result).toEqual([]);
  });

  it('should propagate errors from the read port', async () => {
    mockDashboardRead.getCropsDistribution.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetCropsDistributionQuery())).rejects.toThrow('DB error');
  });
});
