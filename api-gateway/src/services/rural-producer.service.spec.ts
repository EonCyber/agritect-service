import {
  BadRequestException,
  GatewayTimeoutException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NatsPublisherService } from '../messaging/nats-publisher.service';
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
import { RuralProducerService } from './rural-producer.service';

const cmdResult: CommandExecutionResultDto = {
  processId: 'proc-1',
  status: CommandExecutionStatus.PENDING,
  createdAt: new Date().toISOString(),
};

const mockPublisher = {
  createRuralProducer: jest.fn(),
  updateRuralProducer: jest.fn(),
  deleteRuralProducer: jest.fn(),
  addPlanting: jest.fn(),
  removePlanting: jest.fn(),
  getRuralProducer: jest.fn(),
  listRuralProducers: jest.fn(),
  getProcessStatus: jest.fn(),
  getDashboardMetrics: jest.fn(),
  getFarmsByState: jest.fn(),
  getCropsDistribution: jest.fn(),
  getLandUse: jest.fn(),
  listCrops: jest.fn(),
  listHarvestSeasons: jest.fn(),
};

describe('RuralProducerService', () => {
  let service: RuralProducerService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuralProducerService,
        { provide: NatsPublisherService, useValue: mockPublisher },
      ],
    }).compile();

    service = module.get(RuralProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─── Commands ────────────────────────────────────────────────────────────────

  describe('createRuralProducer()', () => {
    it('calls publisher and returns result', async () => {
      mockPublisher.createRuralProducer.mockResolvedValue(cmdResult);

      const result = await service.createRuralProducer('123', 'PF', 'Farm');

      expect(mockPublisher.createRuralProducer).toHaveBeenCalledTimes(1);
      expect(mockPublisher.createRuralProducer).toHaveBeenCalledWith(
        expect.objectContaining({ taxId: '123', taxIdType: 'PF', name: 'Farm' }),
      );
      expect(result).toEqual(cmdResult);
    });

    it('throws GatewayTimeoutException on timeout error', async () => {
      mockPublisher.createRuralProducer.mockRejectedValue(new Error('timeout'));

      await expect(service.createRuralProducer('123', 'PF', 'Farm')).rejects.toThrow(
        GatewayTimeoutException,
      );
    });

    it('throws BadRequestException on conflict error', async () => {
      mockPublisher.createRuralProducer.mockRejectedValue(new Error('conflict'));

      await expect(service.createRuralProducer('123', 'PF', 'Farm')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws InternalServerErrorException on unexpected error', async () => {
      mockPublisher.createRuralProducer.mockRejectedValue(new Error('some unknown error'));

      await expect(service.createRuralProducer('123', 'PF', 'Farm')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateRuralProducer()', () => {
    it('calls publisher with id and name', async () => {
      mockPublisher.updateRuralProducer.mockResolvedValue(cmdResult);

      const result = await service.updateRuralProducer('id-1', 'New Name');

      expect(mockPublisher.updateRuralProducer).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'id-1', name: 'New Name' }),
      );
      expect(result).toEqual(cmdResult);
    });
  });

  describe('deleteRuralProducer()', () => {
    it('calls publisher with id', async () => {
      mockPublisher.deleteRuralProducer.mockResolvedValue(cmdResult);

      await service.deleteRuralProducer('id-1');

      expect(mockPublisher.deleteRuralProducer).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'id-1' }),
      );
    });
  });

  describe('addPlanting()', () => {
    it('calls publisher with all planting fields', async () => {
      mockPublisher.addPlanting.mockResolvedValue(cmdResult);

      await service.addPlanting('prod-1', 'farm-1', 'crop-1', 'season-1');

      expect(mockPublisher.addPlanting).toHaveBeenCalledWith(
        expect.objectContaining({
          ruralProducerId: 'prod-1',
          farmId: 'farm-1',
          cropId: 'crop-1',
          harvestSeasonId: 'season-1',
        }),
      );
    });
  });

  describe('removePlanting()', () => {
    it('calls publisher with all planting fields', async () => {
      mockPublisher.removePlanting.mockResolvedValue(cmdResult);

      await service.removePlanting('prod-1', 'farm-1', 'crop-1', 'season-1');

      expect(mockPublisher.removePlanting).toHaveBeenCalledWith(
        expect.objectContaining({
          ruralProducerId: 'prod-1',
          farmId: 'farm-1',
          cropId: 'crop-1',
          harvestSeasonId: 'season-1',
        }),
      );
    });
  });

  // ─── Queries ─────────────────────────────────────────────────────────────────

  describe('getRuralProducer()', () => {
    it('returns producer when found', async () => {
      const producer = { id: 'id-1' } as GetRuralProducerResultDto;
      mockPublisher.getRuralProducer.mockResolvedValue(producer);

      const result = await service.getRuralProducer('id-1');

      expect(mockPublisher.getRuralProducer).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'id-1' }),
      );
      expect(result).toEqual(producer);
    });

    it('throws NotFoundException when result is null', async () => {
      mockPublisher.getRuralProducer.mockResolvedValue(null);

      await expect(service.getRuralProducer('id-1')).rejects.toThrow(NotFoundException);
    });

    it('throws GatewayTimeoutException on timeout', async () => {
      mockPublisher.getRuralProducer.mockRejectedValue(new Error('Timeout exceeded'));

      await expect(service.getRuralProducer('id-1')).rejects.toThrow(GatewayTimeoutException);
    });
  });

  describe('listRuralProducers()', () => {
    it('returns list from publisher', async () => {
      const list = { items: [] } as ListRuralProducersResultDto;
      mockPublisher.listRuralProducers.mockResolvedValue(list);

      const result = await service.listRuralProducers();

      expect(mockPublisher.listRuralProducers).toHaveBeenCalledTimes(1);
      expect(result).toEqual(list);
    });
  });

  describe('getProcessStatus()', () => {
    it('returns status when found', async () => {
      const status = { processId: 'proc-1' } as GetProcessStatusResultDto;
      mockPublisher.getProcessStatus.mockResolvedValue(status);

      const result = await service.getProcessStatus('proc-1');

      expect(result).toEqual(status);
    });

    it('throws NotFoundException when result is null', async () => {
      mockPublisher.getProcessStatus.mockResolvedValue(null);

      await expect(service.getProcessStatus('proc-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  describe('getDashboardMetrics()', () => {
    it('returns metrics from publisher', async () => {
      const metrics = { totalFarms: 5 } as DashboardMetricsResultDto;
      mockPublisher.getDashboardMetrics.mockResolvedValue(metrics);

      expect(await service.getDashboardMetrics()).toEqual(metrics);
    });
  });

  describe('getFarmsByState()', () => {
    it('returns data from publisher', async () => {
      const data = { items: [] } as FarmsByStateResultDto;
      mockPublisher.getFarmsByState.mockResolvedValue(data);

      expect(await service.getFarmsByState()).toEqual(data);
    });
  });

  describe('getCropsDistribution()', () => {
    it('returns data from publisher', async () => {
      const data = { items: [] } as CropsDistributionResultDto;
      mockPublisher.getCropsDistribution.mockResolvedValue(data);

      expect(await service.getCropsDistribution()).toEqual(data);
    });
  });

  describe('getLandUse()', () => {
    it('returns data from publisher', async () => {
      const data = { agriculturalArea: 80, vegetationArea: 20 } as LandUseResultDto;
      mockPublisher.getLandUse.mockResolvedValue(data);

      expect(await service.getLandUse()).toEqual(data);
    });
  });

  // ─── Reference data ──────────────────────────────────────────────────────────

  describe('listCrops()', () => {
    it('returns crop list from publisher', async () => {
      const data = { items: [] } as CropListResultDto;
      mockPublisher.listCrops.mockResolvedValue(data);

      expect(await service.listCrops()).toEqual(data);
    });
  });

  describe('listHarvestSeasons()', () => {
    it('returns harvest season list from publisher', async () => {
      const data = { items: [] } as HarvestSeasonListResultDto;
      mockPublisher.listHarvestSeasons.mockResolvedValue(data);

      expect(await service.listHarvestSeasons()).toEqual(data);
    });
  });

  // ─── Error translation ───────────────────────────────────────────────────────

  describe('error translation (via listRuralProducers)', () => {
    it('translates "not found" error to NotFoundException', async () => {
      mockPublisher.listRuralProducers.mockRejectedValue(new Error('not found'));

      await expect(service.listRuralProducers()).rejects.toThrow(NotFoundException);
    });

    it('translates "invalid" error to BadRequestException', async () => {
      mockPublisher.listRuralProducers.mockRejectedValue(new Error('invalid input'));

      await expect(service.listRuralProducers()).rejects.toThrow(BadRequestException);
    });

    it('translates unknown errors to InternalServerErrorException', async () => {
      mockPublisher.listRuralProducers.mockRejectedValue(new Error('something broke'));

      await expect(service.listRuralProducers()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
