import { Test, TestingModule } from '@nestjs/testing';
import {
  GetRuralProducerQueryHandler,
  RURAL_PRODUCER_READ,
} from '../../../../src/modules/rural-producer/app/queries/get-rural-producer.handler';
import { GetRuralProducerQuery } from '../../../../src/modules/rural-producer/app/queries/interfaces/get-rural-producer.query';
import { TaxIdType } from '../../../../src/modules/rural-producer/domain/entities/rural-producer';
import type { RuralProducerReadModel } from '../../../../src/modules/rural-producer/app/ports/rural-producer-read.port';

const makeReadModel = (): RuralProducerReadModel => ({
  id: 'uuid-1',
  taxId: '12345678901',
  taxIdType: TaxIdType.PF,
  name: 'João da Silva',
  farms: [],
});

describe('GetRuralProducerQueryHandler', () => {
  let handler: GetRuralProducerQueryHandler;
  const mockReadPort = {
    findById: jest.fn(),
    list: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRuralProducerQueryHandler,
        { provide: RURAL_PRODUCER_READ, useValue: mockReadPort },
      ],
    }).compile();

    handler = module.get(GetRuralProducerQueryHandler);
  });

  it('should return the read model when producer exists', async () => {
    const model = makeReadModel();
    mockReadPort.findById.mockResolvedValue(model);

    const result = await handler.execute(new GetRuralProducerQuery('uuid-1'));

    expect(mockReadPort.findById).toHaveBeenCalledWith('uuid-1');
    expect(result).toBe(model);
  });

  it('should return null when producer does not exist', async () => {
    mockReadPort.findById.mockResolvedValue(null);

    const result = await handler.execute(new GetRuralProducerQuery('missing'));

    expect(mockReadPort.findById).toHaveBeenCalledWith('missing');
    expect(result).toBeNull();
  });

  it('should propagate errors from the read port', async () => {
    mockReadPort.findById.mockRejectedValue(new Error('DB error'));

    await expect(handler.execute(new GetRuralProducerQuery('uuid-1'))).rejects.toThrow('DB error');
  });
});
