import { Test, TestingModule } from '@nestjs/testing';
import {
  DeleteRuralProducerCommandHandler,
  RURAL_PRODUCER_REPOSITORY,
  PROCESS_REPOSITORY,
} from '../../../../src/modules/rural-producer/app/commands/delete-rural-producer.handler';
import { DeleteRuralProducerCommand } from '../../../../src/modules/rural-producer/app/commands/interfaces/delete-rural-producer.command';

describe('DeleteRuralProducerCommandHandler', () => {
  let handler: DeleteRuralProducerCommandHandler;
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
        DeleteRuralProducerCommandHandler,
        { provide: RURAL_PRODUCER_REPOSITORY, useValue: mockRepository },
        { provide: PROCESS_REPOSITORY, useValue: mockProcessRepository },
      ],
    }).compile();

    handler = module.get(DeleteRuralProducerCommandHandler);
  });

  it('should call repository.delete with the correct id', async () => {
    mockRepository.delete.mockResolvedValue(undefined);

    const command = new DeleteRuralProducerCommand('uuid-1');
    await handler.execute(command);

    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    expect(mockRepository.delete).toHaveBeenCalledWith('uuid-1');
  });

  it('should propagate repository errors', async () => {
    mockRepository.delete.mockRejectedValue(new Error('not found'));

    const command = new DeleteRuralProducerCommand('missing-id');

    await expect(handler.execute(command)).rejects.toThrow('not found');
  });
});
