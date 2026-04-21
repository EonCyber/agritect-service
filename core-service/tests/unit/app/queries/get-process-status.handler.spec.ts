import { Test, TestingModule } from '@nestjs/testing';
import {
  GetProcessStatusQueryHandler,
  PROCESS_REPOSITORY,
} from '../../../../src/modules/rural-producer/app/queries/get-process-status.handler';
import { GetProcessStatusQuery } from '../../../../src/modules/rural-producer/app/queries/interfaces/get-process-status.query';
import {
  CommandExecution,
  CommandExecutionStatus,
} from '../../../../src/modules/rural-producer/domain/entities/command-execution';

const makeExecution = (): CommandExecution =>
  new CommandExecution(
    'exec-id-1',
    'CreateRuralProducerCommand',
    'corr-abc',
    CommandExecutionStatus.COMPLETED,
  );

describe('GetProcessStatusQueryHandler', () => {
  let handler: GetProcessStatusQueryHandler;
  const mockProcessRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProcessStatusQueryHandler,
        { provide: PROCESS_REPOSITORY, useValue: mockProcessRepository },
      ],
    }).compile();

    handler = module.get(GetProcessStatusQueryHandler);
  });

  it('should return the CommandExecution when found', async () => {
    const execution = makeExecution();
    mockProcessRepository.findById.mockResolvedValue(execution);

    const result = await handler.execute(new GetProcessStatusQuery('exec-id-1'));

    expect(mockProcessRepository.findById).toHaveBeenCalledWith('exec-id-1');
    expect(result).toBe(execution);
  });

  it('should return null when not found', async () => {
    mockProcessRepository.findById.mockResolvedValue(null);

    const result = await handler.execute(new GetProcessStatusQuery('unknown-id'));

    expect(mockProcessRepository.findById).toHaveBeenCalledWith('unknown-id');
    expect(result).toBeNull();
  });

  it('should propagate repository errors', async () => {
    const error = new Error('DB connection failed');
    mockProcessRepository.findById.mockRejectedValue(error);

    await expect(
      handler.execute(new GetProcessStatusQuery('exec-id-1')),
    ).rejects.toThrow('DB connection failed');
  });
});
