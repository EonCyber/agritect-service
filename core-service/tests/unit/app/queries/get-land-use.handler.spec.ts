import { Test, TestingModule } from '@nestjs/testing';
import {
  GetLandUseQueryHandler,
  DASHBOARD_READ,
} from '../../../../src/modules/rural-producer/app/queries/get-land-use.handler';
import { GetLandUseQuery } from '../../../../src/modules/rural-producer/app/queries/interfaces/get-land-use.query';
import type { LandUseMetrics } from '../../../../src/modules/rural-producer/app/ports/dashboard-read.port';

describe('GetLandUseQueryHandler', () => {
  let handler: GetLandUseQueryHandler;
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
        GetLandUseQueryHandler,
        { provide: DASHBOARD_READ, useValue: mockDashboardRead },
      ],
    }).compile();

    handler = module.get(GetLandUseQueryHandler);
  });

  it('should return land use metrics', async () => {
    const metrics: LandUseMetrics = {
      totalArableAreaHectares: 300,
      totalVegetationAreaHectares: 150,
      totalOtherAreaHectares: 50,
    };
    mockDashboardRead.getLandUse.mockResolvedValue(metrics);

    const result = await handler.execute(new GetLandUseQuery());

    expect(mockDashboardRead.getLandUse).toHaveBeenCalledTimes(1);
    expect(result).toBe(metrics);
  });

  it('should return zero values when there is no data', async () => {
    const metrics: LandUseMetrics = {
      totalArableAreaHectares: 0,
      totalVegetationAreaHectares: 0,
      totalOtherAreaHectares: 0,
    };
    mockDashboardRead.getLandUse.mockResolvedValue(metrics);

    const result = await handler.execute(new GetLandUseQuery());

    expect(result.totalArableAreaHectares).toBe(0);
    expect(result.totalVegetationAreaHectares).toBe(0);
    expect(result.totalOtherAreaHectares).toBe(0);
  });

  it('should propagate errors from the read port', async () => {
    mockDashboardRead.getLandUse.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetLandUseQuery())).rejects.toThrow('DB error');
  });
});
