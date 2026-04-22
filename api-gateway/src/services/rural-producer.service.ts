import {
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AddPlantingPayloadDto } from '../models/messaging-dtos/add-planting-payload.dto';
import { CreateRuralProducerPayloadDto } from '../models/messaging-dtos/create-rural-producer-payload.dto';
import { DeleteRuralProducerPayloadDto } from '../models/messaging-dtos/delete-rural-producer-payload.dto';
import { GetProcessStatusPayloadDto } from '../models/messaging-dtos/get-process-status-payload.dto';
import { GetRuralProducerPayloadDto } from '../models/messaging-dtos/get-rural-producer-payload.dto';
import { RemovePlantingPayloadDto } from '../models/messaging-dtos/remove-planting-payload.dto';
import { UpdateRuralProducerPayloadDto } from '../models/messaging-dtos/update-rural-producer-payload.dto';
import { CommandExecutionResultDto } from '../models/results-dtos/command-execution-result.dto';
import { CropListResultDto } from '../models/results-dtos/crop-list-result.dto';
import { CropsDistributionResultDto } from '../models/results-dtos/crops-distribution-result.dto';
import { DashboardMetricsResultDto } from '../models/results-dtos/dashboard-metrics-result.dto';
import { FarmsByStateResultDto } from '../models/results-dtos/farms-by-state-result.dto';
import { GetProcessStatusResultDto } from '../models/results-dtos/get-process-status-result.dto';
import { GetRuralProducerResultDto } from '../models/results-dtos/get-rural-producer-result.dto';
import { HarvestSeasonListResultDto } from '../models/results-dtos/harvest-season-list-result.dto';
import { LandUseResultDto } from '../models/results-dtos/land-use-result.dto';
import { ListRuralProducersResultDto } from '../models/results-dtos/list-rural-producers-result.dto';
import { NatsPublisherService } from '../messaging/nats-publisher.service';

@Injectable()
export class RuralProducerService {
  private readonly logger = new Logger(RuralProducerService.name);

  constructor(private readonly publisher: NatsPublisherService) {}

  // ─── Commands ────────────────────────────────────────────────────────────────

  async createRuralProducer(
    taxId: string,
    taxIdType: 'PF' | 'PJ',
    name: string,
  ): Promise<CommandExecutionResultDto> {
    const payload = new CreateRuralProducerPayloadDto();
    payload.taxId = taxId;
    payload.taxIdType = taxIdType;
    payload.name = name;

    return this.publish(() => this.publisher.createRuralProducer(payload), 'createRuralProducer');
  }

  async updateRuralProducer(
    id: string,
    name: string,
  ): Promise<CommandExecutionResultDto> {
    const payload = new UpdateRuralProducerPayloadDto();
    payload.id = id;
    payload.name = name;

    return this.publish(() => this.publisher.updateRuralProducer(payload), 'updateRuralProducer');
  }

  async deleteRuralProducer(id: string): Promise<CommandExecutionResultDto> {
    const payload = new DeleteRuralProducerPayloadDto();
    payload.id = id;

    return this.publish(() => this.publisher.deleteRuralProducer(payload), 'deleteRuralProducer');
  }

  async addPlanting(
    ruralProducerId: string,
    farmId: string,
    cropId: string,
    harvestSeasonId: string,
  ): Promise<CommandExecutionResultDto> {
    const payload = new AddPlantingPayloadDto();
    payload.ruralProducerId = ruralProducerId;
    payload.farmId = farmId;
    payload.cropId = cropId;
    payload.harvestSeasonId = harvestSeasonId;

    return this.publish(() => this.publisher.addPlanting(payload), 'addPlanting');
  }

  async removePlanting(
    ruralProducerId: string,
    farmId: string,
    cropId: string,
    harvestSeasonId: string,
  ): Promise<CommandExecutionResultDto> {
    const payload = new RemovePlantingPayloadDto();
    payload.ruralProducerId = ruralProducerId;
    payload.farmId = farmId;
    payload.cropId = cropId;
    payload.harvestSeasonId = harvestSeasonId;

    return this.publish(() => this.publisher.removePlanting(payload), 'removePlanting');
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  async getRuralProducer(id: string): Promise<GetRuralProducerResultDto> {
    const payload = new GetRuralProducerPayloadDto();
    payload.id = id;

    const result = await this.publish(
      () => this.publisher.getRuralProducer(payload),
      'getRuralProducer',
    );

    if (!result) {
      throw new NotFoundException(`Rural producer ${id} not found`);
    }

    return result;
  }

  async listRuralProducers(): Promise<ListRuralProducersResultDto> {
    return this.publish(() => this.publisher.listRuralProducers(), 'listRuralProducers');
  }

  async getProcessStatus(processId: string): Promise<GetProcessStatusResultDto> {
    const payload = new GetProcessStatusPayloadDto();
    payload.processId = processId;

    const result = await this.publish(
      () => this.publisher.getProcessStatus(payload),
      'getProcessStatus',
    );

    if (!result) {
      throw new NotFoundException(`Process ${processId} not found`);
    }

    return result;
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  async getDashboardMetrics(): Promise<DashboardMetricsResultDto> {
    return this.publish(() => this.publisher.getDashboardMetrics(), 'getDashboardMetrics');
  }

  async getFarmsByState(): Promise<FarmsByStateResultDto> {
    return this.publish(() => this.publisher.getFarmsByState(), 'getFarmsByState');
  }

  async getCropsDistribution(): Promise<CropsDistributionResultDto> {
    return this.publish(() => this.publisher.getCropsDistribution(), 'getCropsDistribution');
  }

  async getLandUse(): Promise<LandUseResultDto> {
    return this.publish(() => this.publisher.getLandUse(), 'getLandUse');
  }

  // ─── Reference data ──────────────────────────────────────────────────────────

  async listCrops(): Promise<CropListResultDto> {
    return this.publish(() => this.publisher.listCrops(), 'listCrops');
  }

  async listHarvestSeasons(): Promise<HarvestSeasonListResultDto> {
    return this.publish(() => this.publisher.listHarvestSeasons(), 'listHarvestSeasons');
  }

  // ─── Error handling ──────────────────────────────────────────────────────────

  private async publish<T>(fn: () => Promise<T>, operation: string): Promise<T> {
    try {
      return await fn();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes('timeout') || message.includes('Timeout')) {
        this.logger.warn(`[${operation}] Core service timeout: ${message}`);
        throw new GatewayTimeoutException('Core service did not respond in time');
      }

      if (message.includes('no subscribers') || message.includes('No responders')) {
        this.logger.warn(`[${operation}] No subscribers for message: ${message}`);
        throw new GatewayTimeoutException('Core service is unavailable');
      }

      if (message.includes('Empty response')) {
        throw new NotFoundException('Resource not found');
      }

      if (message.includes('not found') || message.includes('NOT_FOUND')) {
        throw new NotFoundException(message);
      }

      if (message.includes('conflict') || message.includes('CONFLICT') || message.includes('already exists')) {
        throw new BadRequestException(message);
      }

      if (message.includes('invalid') || message.includes('INVALID') || message.includes('validation')) {
        throw new BadRequestException(message);
      }

      this.logger.error(`[${operation}] Unexpected error: ${message}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
