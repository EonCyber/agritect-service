import { Test, TestingModule } from '@nestjs/testing';
import {
  AddPlantingCommandHandler,
  RURAL_PRODUCER_REPOSITORY,
  PROCESS_REPOSITORY,
} from '../../../../src/modules/rural-producer/app/commands/add-planting.handler';
import { AddPlantingCommand } from '../../../../src/modules/rural-producer/app/commands/interfaces/add-planting.command';
import { RuralProducer, TaxIdType } from '../../../../src/modules/rural-producer/domain/entities/rural-producer';
import { Farm } from '../../../../src/modules/rural-producer/domain/entities/farm';
import {
  RuralProducerNotFoundError,
  FarmNotFoundError,
  DuplicatePlantingError,
} from '../../../../src/modules/rural-producer/domain/errors';

const makeFarm = (id: string, producerId: string, plantings = []) =>
  new Farm(id, producerId, 'Farm', 'City', 'SP', 100, 40, 30, plantings);

const makeProducer = (farms: Farm[] = []) =>
  new RuralProducer('producer-1', '12345678901', TaxIdType.PF, 'João da Silva', farms);

describe('AddPlantingCommandHandler', () => {
  let handler: AddPlantingCommandHandler;
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
        AddPlantingCommandHandler,
        { provide: RURAL_PRODUCER_REPOSITORY, useValue: mockRepository },
        { provide: PROCESS_REPOSITORY, useValue: mockProcessRepository },
      ],
    }).compile();

    handler = module.get(AddPlantingCommandHandler);
  });

  it('should add a planting to the farm and save', async () => {
    const farm = makeFarm('farm-1', 'producer-1');
    const producer = makeProducer([farm]);
    mockRepository.findById.mockResolvedValue(producer);
    mockRepository.save.mockResolvedValue(undefined);

    const command = new AddPlantingCommand('producer-1', 'farm-1', 'crop-1', 'harvest-1');
    await handler.execute(command);

    expect(mockRepository.findById).toHaveBeenCalledWith('producer-1');
    expect(farm.plantings).toHaveLength(1);
    expect(farm.plantings[0].cropId).toBe('crop-1');
    expect(farm.plantings[0].harvestSeasonId).toBe('harvest-1');
    expect(mockRepository.save).toHaveBeenCalledWith(producer);
  });

  it('should throw RuralProducerNotFoundError when producer does not exist', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const command = new AddPlantingCommand('missing', 'farm-1', 'crop-1', 'harvest-1');

    await expect(handler.execute(command)).rejects.toThrow(RuralProducerNotFoundError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw FarmNotFoundError when farm does not belong to producer', async () => {
    const producer = makeProducer([]);
    mockRepository.findById.mockResolvedValue(producer);

    const command = new AddPlantingCommand('producer-1', 'nonexistent-farm', 'crop-1', 'harvest-1');

    await expect(handler.execute(command)).rejects.toThrow(FarmNotFoundError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should throw DuplicatePlantingError when same planting already exists', async () => {
    const farm = makeFarm('farm-1', 'producer-1');
    farm.addPlanting('crop-1', 'harvest-1');
    const producer = makeProducer([farm]);
    mockRepository.findById.mockResolvedValue(producer);

    const command = new AddPlantingCommand('producer-1', 'farm-1', 'crop-1', 'harvest-1');

    await expect(handler.execute(command)).rejects.toThrow(DuplicatePlantingError);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
