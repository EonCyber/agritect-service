import { Test, TestingModule } from '@nestjs/testing';
import {
  GetFarmsByStateQueryHandler,
  DASHBOARD_READ,
} from '../../../../src/modules/rural-producer/app/queries/get-farms-by-state.handler';
import { GetFarmsByStateQuery } from '../../../../src/modules/rural-producer/app/queries/interfaces/get-farms-by-state.query';
import type { FarmsByStateItem } from '../../../../src/modules/rural-producer/app/ports/dashboard-read.port';

describe('GetFarmsByStateQueryHandler', () => {
  let handler: GetFarmsByStateQueryHandler;
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
        GetFarmsByStateQueryHandler,
        { provide: DASHBOARD_READ, useValue: mockDashboardRead },
      ],
    }).compile();

    handler = module.get(GetFarmsByStateQueryHandler);
  });

  it('should return farms grouped by state', async () => {
    const items: FarmsByStateItem[] = [
      { state: 'SP', farmsCount: 5 },
      { state: 'MG', farmsCount: 3 },
    ];
    mockDashboardRead.getFarmsByState.mockResolvedValue(items);

    const result = await handler.execute(new GetFarmsByStateQuery());

    expect(mockDashboardRead.getFarmsByState).toHaveBeenCalledTimes(1);
    expect(result).toBe(items);
    expect(result).toHaveLength(2);
  });

  it('should return an empty array when there are no farms', async () => {
    mockDashboardRead.getFarmsByState.mockResolvedValue([]);

    const result = await handler.execute(new GetFarmsByStateQuery());

    expect(result).toEqual([]);
  });

  it('should propagate errors from the read port', async () => {
    mockDashboardRead.getFarmsByState.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetFarmsByStateQuery())).rejects.toThrow('DB error');
  });
});
