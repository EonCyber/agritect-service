import { Test, TestingModule } from '@nestjs/testing';
import {
  ListHarvestSeasonsQueryHandler,
  HARVEST_SEASON_READ,
} from '../../../../src/modules/rural-producer/app/queries/list-harvest-seasons.handler';
import { ListHarvestSeasonsQuery } from '../../../../src/modules/rural-producer/app/queries/interfaces/list-harvest-seasons.query';
import type { HarvestSeasonListItem } from '../../../../src/modules/rural-producer/app/ports/harvest-season-read.port';

describe('ListHarvestSeasonsQueryHandler', () => {
  let handler: ListHarvestSeasonsQueryHandler;
  const mockHarvestSeasonRead = {
    list: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListHarvestSeasonsQueryHandler,
        { provide: HARVEST_SEASON_READ, useValue: mockHarvestSeasonRead },
      ],
    }).compile();

    handler = module.get(ListHarvestSeasonsQueryHandler);
  });

  it('should return a list of harvest seasons', async () => {
    const items: HarvestSeasonListItem[] = [
      { id: 'season-1', year: 2023 },
      { id: 'season-2', year: 2024 },
    ];
    mockHarvestSeasonRead.list.mockResolvedValue(items);

    const result = await handler.execute(new ListHarvestSeasonsQuery());

    expect(mockHarvestSeasonRead.list).toHaveBeenCalledTimes(1);
    expect(result).toBe(items);
    expect(result).toHaveLength(2);
  });

  it('should return an empty array when there are no harvest seasons', async () => {
    mockHarvestSeasonRead.list.mockResolvedValue([]);

    const result = await handler.execute(new ListHarvestSeasonsQuery());

    expect(result).toEqual([]);
  });

  it('should propagate errors from the read port', async () => {
    mockHarvestSeasonRead.list.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new ListHarvestSeasonsQuery())).rejects.toThrow('DB error');
  });
});
