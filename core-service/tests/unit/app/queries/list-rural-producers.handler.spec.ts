import { Test, TestingModule } from '@nestjs/testing';
import {
  ListRuralProducersQueryHandler,
  RURAL_PRODUCER_READ,
} from '../../../../src/modules/rural-producer/app/queries/list-rural-producers.handler';
import { ListRuralProducersQuery } from '../../../../src/modules/rural-producer/app/queries/interfaces/list-rural-producers.query';
import type { RuralProducerListItem } from '../../../../src/modules/rural-producer/app/ports/rural-producer-read.port';

describe('ListRuralProducersQueryHandler', () => {
  let handler: ListRuralProducersQueryHandler;
  const mockReadPort = {
    findById: jest.fn(),
    list: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListRuralProducersQueryHandler,
        { provide: RURAL_PRODUCER_READ, useValue: mockReadPort },
      ],
    }).compile();

    handler = module.get(ListRuralProducersQueryHandler);
  });

  it('should return a list of producers', async () => {
    const items: RuralProducerListItem[] = [
      { id: 'uuid-1', name: 'João', taxId: '12345678901', farmsCount: 2 },
      { id: 'uuid-2', name: 'Maria', taxId: '98765432100', farmsCount: 0 },
    ];
    mockReadPort.list.mockResolvedValue(items);

    const result = await handler.execute(new ListRuralProducersQuery());

    expect(mockReadPort.list).toHaveBeenCalledTimes(1);
    expect(result).toBe(items);
    expect(result).toHaveLength(2);
  });

  it('should return an empty array when there are no producers', async () => {
    mockReadPort.list.mockResolvedValue([]);

    const result = await handler.execute(new ListRuralProducersQuery());

    expect(result).toEqual([]);
  });

  it('should propagate errors from the read port', async () => {
    mockReadPort.list.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new ListRuralProducersQuery())).rejects.toThrow('DB error');
  });
});
