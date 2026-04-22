import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateRuralProducerCommandHandler,
  RURAL_PRODUCER_REPOSITORY,
  PROCESS_REPOSITORY,
} from '../../../../src/modules/rural-producer/app/commands/create-rural-producer.handler';
import { CreateRuralProducerCommand } from '../../../../src/modules/rural-producer/app/commands/interfaces/create-rural-producer.command';
import { RuralProducer, TaxIdType } from '../../../../src/modules/rural-producer/domain/entities/rural-producer';
import { InvalidTaxIdError } from '../../../../src/modules/rural-producer/domain/errors';

describe('CreateRuralProducerCommandHandler', () => {
  let handler: CreateRuralProducerCommandHandler;
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
        CreateRuralProducerCommandHandler,
        { provide: RURAL_PRODUCER_REPOSITORY, useValue: mockRepository },
        { provide: PROCESS_REPOSITORY, useValue: mockProcessRepository },
      ],
    }).compile();

    handler = module.get(CreateRuralProducerCommandHandler);
  });

  it('should save a new RuralProducer with generated ID', async () => {
    mockRepository.save.mockResolvedValue(undefined);

    const command = new CreateRuralProducerCommand(
      '12345678901',
      TaxIdType.PF,
      'João da Silva',
    );

    const result = await handler.execute(command);

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    const saved: RuralProducer = mockRepository.save.mock.calls[0][0];
    expect(saved).toBeInstanceOf(RuralProducer);
    expect(saved.id).toBeDefined();
    expect(saved.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(saved.taxIdType).toBe(TaxIdType.PF);
    expect(saved.name).toBe('João da Silva');
    expect(result.processId).toBeDefined();
    expect(result.status).toBe('COMPLETED');
  });

  it('should throw InvalidTaxIdError when taxId has wrong length', async () => {
    const command = new CreateRuralProducerCommand(
      '123',
      TaxIdType.PF,
      'João da Silva',
    );

    await expect(handler.execute(command)).rejects.toThrow(InvalidTaxIdError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw on invalid name (too short)', async () => {
    const command = new CreateRuralProducerCommand(
      '12345678901',
      TaxIdType.PF,
      'Jo',
    );

    await expect(handler.execute(command)).rejects.toThrow();
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should propagate repository errors', async () => {
    mockRepository.save.mockRejectedValue(new Error('DB error'));

    const command = new CreateRuralProducerCommand(
      '12345678901',
      TaxIdType.PF,
      'João da Silva',
    );

    await expect(handler.execute(command)).rejects.toThrow('DB error');
  });
});
