import { Test, TestingModule } from '@nestjs/testing';
import {
  UpdateRuralProducerCommandHandler,
  RURAL_PRODUCER_REPOSITORY,
  PROCESS_REPOSITORY,
} from '../../../../src/modules/rural-producer/app/commands/update-rural-producer.handler';
import { UpdateRuralProducerCommand } from '../../../../src/modules/rural-producer/app/commands/interfaces/update-rural-producer.command';
import { RuralProducer, TaxIdType } from '../../../../src/modules/rural-producer/domain/entities/rural-producer';
import { RuralProducerNotFoundError } from '../../../../src/modules/rural-producer/domain/errors';

const makeProducer = (overrides: Partial<ConstructorParameters<typeof RuralProducer>[0]> = {}) =>
  new RuralProducer('uuid-1', '12345678901', TaxIdType.PF, 'Original Name');

describe('UpdateRuralProducerCommandHandler', () => {
  let handler: UpdateRuralProducerCommandHandler;
  const mockRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
  };
  const mockProcessRepository = {
    save: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockProcessRepository.save.mockResolvedValue(undefined);
    mockProcessRepository.update.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRuralProducerCommandHandler,
        { provide: RURAL_PRODUCER_REPOSITORY, useValue: mockRepository },
        { provide: PROCESS_REPOSITORY, useValue: mockProcessRepository },
      ],
    }).compile();

    handler = module.get(UpdateRuralProducerCommandHandler);
  });

  it('should update the name and save the producer', async () => {
    const existing = makeProducer();
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.save.mockResolvedValue(undefined);

    const command = new UpdateRuralProducerCommand('uuid-1', 'New Name');
    await handler.execute(command);

    expect(mockRepository.findById).toHaveBeenCalledWith('uuid-1');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    const saved: RuralProducer = mockRepository.save.mock.calls[0][0];
    expect(saved.name).toBe('New Name');
    expect(saved.taxId).toBe(existing.taxId);
    expect(saved.taxIdType).toBe(existing.taxIdType);
  });

  it('should throw RuralProducerNotFoundError when producer does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const command = new UpdateRuralProducerCommand('missing-id', 'New Name');

    await expect(handler.execute(command)).rejects.toThrow(RuralProducerNotFoundError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw on invalid new name (too short)', async () => {
    const existing = makeProducer();
    mockRepository.findById.mockResolvedValue(existing);

    const command = new UpdateRuralProducerCommand('uuid-1', 'Ab');

    await expect(handler.execute(command)).rejects.toThrow();
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should propagate repository errors from save', async () => {
    const existing = makeProducer();
    mockRepository.findById.mockResolvedValue(existing);
    mockRepository.save.mockRejectedValue(new Error('DB error'));

    const command = new UpdateRuralProducerCommand('uuid-1', 'New Name');

    await expect(handler.execute(command)).rejects.toThrow('DB error');
  });
});
