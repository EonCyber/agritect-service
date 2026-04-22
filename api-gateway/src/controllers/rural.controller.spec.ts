import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommandExecutionResultDto, CommandExecutionStatus } from '../models/results-dtos/command-execution-result.dto';
import { CropListResultDto } from '../models/results-dtos/crop-list-result.dto';
import { CropsDistributionResultDto } from '../models/results-dtos/crops-distribution-result.dto';
import { DashboardMetricsResultDto } from '../models/results-dtos/dashboard-metrics-result.dto';
import { FarmsByStateResultDto } from '../models/results-dtos/farms-by-state-result.dto';
import { GetProcessStatusResultDto } from '../models/results-dtos/get-process-status-result.dto';
import { GetRuralProducerResultDto } from '../models/results-dtos/get-rural-producer-result.dto';
import { HarvestSeasonListResultDto } from '../models/results-dtos/harvest-season-list-result.dto';
import { LandUseResultDto } from '../models/results-dtos/land-use-result.dto';
import { ListRuralProducersResultDto } from '../models/results-dtos/list-rural-producers-result.dto';
import { RuralProducerService } from '../services/rural-producer.service';
import { AddPlantingRequestDto } from './dto/add-planting-request.dto';
import { CreateRuralProducerRequestDto } from './dto/create-rural-producer-request.dto';
import { RemovePlantingRequestDto } from './dto/remove-planting-request.dto';
import { UpdateRuralProducerRequestDto } from './dto/update-rural-producer-request.dto';
import { RuralController } from './rural.controller';

const cmdResult: CommandExecutionResultDto = {
  processId: 'proc-1',
  status: CommandExecutionStatus.PENDING,
  createdAt: new Date().toISOString(),
};

const mockService = {
  createRuralProducer: jest.fn(),
  updateRuralProducer: jest.fn(),
  deleteRuralProducer: jest.fn(),
  addPlanting: jest.fn(),
  removePlanting: jest.fn(),
  getRuralProducer: jest.fn(),
  listRuralProducers: jest.fn(),
  getDashboardMetrics: jest.fn(),
  getFarmsByState: jest.fn(),
  getCropsDistribution: jest.fn(),
  getLandUse: jest.fn(),
  getProcessStatus: jest.fn(),
  listCrops: jest.fn(),
  listHarvestSeasons: jest.fn(),
};

describe('RuralController', () => {
  let controller: RuralController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RuralController],
      providers: [{ provide: RuralProducerService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(RuralController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── Commands ────────────────────────────────────────────────────────────────

  describe('createRuralProducer()', () => {
    it('delegates to service with correct args', async () => {
      mockService.createRuralProducer.mockResolvedValue(cmdResult);
      const dto: CreateRuralProducerRequestDto = { taxId: '123', taxIdType: 'PF', name: 'Farm' };

      const result = await controller.createRuralProducer(dto);

      expect(mockService.createRuralProducer).toHaveBeenCalledWith('123', 'PF', 'Farm');
      expect(result).toEqual(cmdResult);
    });

    it('propagates exceptions from service', async () => {
      mockService.createRuralProducer.mockRejectedValue(new Error('fail'));
      const dto: CreateRuralProducerRequestDto = { taxId: '123', taxIdType: 'PF', name: 'Farm' };

      await expect(controller.createRuralProducer(dto)).rejects.toThrow('fail');
    });
  });

  describe('updateRuralProducer()', () => {
    it('delegates to service with id and name', async () => {
      mockService.updateRuralProducer.mockResolvedValue(cmdResult);
      const dto: UpdateRuralProducerRequestDto = { name: 'New Name' };

      const result = await controller.updateRuralProducer('id-1', dto);

      expect(mockService.updateRuralProducer).toHaveBeenCalledWith('id-1', 'New Name');
      expect(result).toEqual(cmdResult);
    });
  });

  describe('deleteRuralProducer()', () => {
    it('delegates to service with id', async () => {
      mockService.deleteRuralProducer.mockResolvedValue(cmdResult);

      const result = await controller.deleteRuralProducer('id-1');

      expect(mockService.deleteRuralProducer).toHaveBeenCalledWith('id-1');
      expect(result).toEqual(cmdResult);
    });
  });

  describe('addPlanting()', () => {
    it('delegates to service with all planting args', async () => {
      mockService.addPlanting.mockResolvedValue(cmdResult);
      const dto: AddPlantingRequestDto = { farmId: 'f-1', cropId: 'c-1', harvestSeasonId: 'h-1' };

      const result = await controller.addPlanting('prod-1', dto);

      expect(mockService.addPlanting).toHaveBeenCalledWith('prod-1', 'f-1', 'c-1', 'h-1');
      expect(result).toEqual(cmdResult);
    });
  });

  describe('removePlanting()', () => {
    it('delegates to service with all planting args', async () => {
      mockService.removePlanting.mockResolvedValue(cmdResult);
      const dto: RemovePlantingRequestDto = { farmId: 'f-1', cropId: 'c-1', harvestSeasonId: 'h-1' };

      const result = await controller.removePlanting('prod-1', dto);

      expect(mockService.removePlanting).toHaveBeenCalledWith('prod-1', 'f-1', 'c-1', 'h-1');
      expect(result).toEqual(cmdResult);
    });
  });

  // ─── Queries ─────────────────────────────────────────────────────────────────

  describe('getRuralProducer()', () => {
    it('returns producer from service', async () => {
      const producer = { id: 'id-1' } as GetRuralProducerResultDto;
      mockService.getRuralProducer.mockResolvedValue(producer);

      const result = await controller.getRuralProducer('id-1');

      expect(mockService.getRuralProducer).toHaveBeenCalledWith('id-1');
      expect(result).toEqual(producer);
    });

    it('propagates NotFoundException', async () => {
      mockService.getRuralProducer.mockRejectedValue(new NotFoundException());

      await expect(controller.getRuralProducer('id-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listRuralProducers()', () => {
    it('returns list from service', async () => {
      const list = { items: [] } as ListRuralProducersResultDto;
      mockService.listRuralProducers.mockResolvedValue(list);

      const result = await controller.listRuralProducers();

      expect(mockService.listRuralProducers).toHaveBeenCalledTimes(1);
      expect(result).toEqual(list);
    });
  });

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  describe('getDashboardMetrics()', () => {
    it('returns metrics from service', async () => {
      const metrics = { totalFarms: 10 } as DashboardMetricsResultDto;
      mockService.getDashboardMetrics.mockResolvedValue(metrics);

      expect(await controller.getDashboardMetrics()).toEqual(metrics);
      expect(mockService.getDashboardMetrics).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFarmsByState()', () => {
    it('returns farms by state from service', async () => {
      const data = { items: [] } as FarmsByStateResultDto;
      mockService.getFarmsByState.mockResolvedValue(data);

      expect(await controller.getFarmsByState()).toEqual(data);
    });
  });

  describe('getCropsDistribution()', () => {
    it('returns crops distribution from service', async () => {
      const data = { items: [] } as CropsDistributionResultDto;
      mockService.getCropsDistribution.mockResolvedValue(data);

      expect(await controller.getCropsDistribution()).toEqual(data);
    });
  });

  describe('getLandUse()', () => {
    it('returns land use from service', async () => {
      const data = { agriculturalArea: 100, vegetationArea: 50 } as LandUseResultDto;
      mockService.getLandUse.mockResolvedValue(data);

      expect(await controller.getLandUse()).toEqual(data);
    });
  });

  // ─── Reference data ──────────────────────────────────────────────────────────

  describe('listCrops()', () => {
    it('returns crop list from service', async () => {
      const data = { items: [] } as CropListResultDto;
      mockService.listCrops.mockResolvedValue(data);

      expect(await controller.listCrops()).toEqual(data);
      expect(mockService.listCrops).toHaveBeenCalledTimes(1);
    });
  });

  describe('listHarvestSeasons()', () => {
    it('returns harvest season list from service', async () => {
      const data = { items: [] } as HarvestSeasonListResultDto;
      mockService.listHarvestSeasons.mockResolvedValue(data);

      expect(await controller.listHarvestSeasons()).toEqual(data);
    });
  });

  // ─── Process ─────────────────────────────────────────────────────────────────

  describe('getProcessStatus()', () => {
    it('returns process status from service', async () => {
      const status = { processId: 'proc-1' } as GetProcessStatusResultDto;
      mockService.getProcessStatus.mockResolvedValue(status);

      const result = await controller.getProcessStatus('proc-1');

      expect(mockService.getProcessStatus).toHaveBeenCalledWith('proc-1');
      expect(result).toEqual(status);
    });

    it('propagates NotFoundException', async () => {
      mockService.getProcessStatus.mockRejectedValue(new NotFoundException());

      await expect(controller.getProcessStatus('proc-1')).rejects.toThrow(NotFoundException);
    });
  });
});
