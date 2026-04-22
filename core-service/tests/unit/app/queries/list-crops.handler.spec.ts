import { Test, TestingModule } from '@nestjs/testing';
import {
  ListCropsQueryHandler,
  CROP_READ,
} from '../../../../src/modules/rural-producer/app/queries/list-crops.handler';
import { ListCropsQuery } from '../../../../src/modules/rural-producer/app/queries/interfaces/list-crops.query';
import type { CropListItem } from '../../../../src/modules/rural-producer/app/ports/crop-read.port';

describe('ListCropsQueryHandler', () => {
  let handler: ListCropsQueryHandler;
  const mockCropRead = {
    list: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListCropsQueryHandler,
        { provide: CROP_READ, useValue: mockCropRead },
      ],
    }).compile();

    handler = module.get(ListCropsQueryHandler);
  });

  it('should return a list of crops', async () => {
    const items: CropListItem[] = [
      { id: 'crop-1', name: 'Soja' },
      { id: 'crop-2', name: 'Milho' },
    ];
    mockCropRead.list.mockResolvedValue(items);

    const result = await handler.execute(new ListCropsQuery());

    expect(mockCropRead.list).toHaveBeenCalledTimes(1);
    expect(result).toBe(items);
    expect(result).toHaveLength(2);
  });

  it('should return an empty array when there are no crops', async () => {
    mockCropRead.list.mockResolvedValue([]);

    const result = await handler.execute(new ListCropsQuery());

    expect(result).toEqual([]);
  });

  it('should propagate errors from the read port', async () => {
    mockCropRead.list.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new ListCropsQuery())).rejects.toThrow('DB error');
  });
});
