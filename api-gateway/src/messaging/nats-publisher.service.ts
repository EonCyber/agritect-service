import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, map, tap } from 'rxjs';
import { AddPlantingPayloadDto } from '../models/messaging-dtos/add-planting-payload.dto';
import { CreateRuralProducerPayloadDto } from '../models/messaging-dtos/create-rural-producer-payload.dto';
import { CreateUserPayloadDto } from '../models/messaging-dtos/create-user-payload.dto';
import { DeleteRuralProducerPayloadDto } from '../models/messaging-dtos/delete-rural-producer-payload.dto';
import { EmptyPayloadDto } from '../models/messaging-dtos/empty-payload.dto';
import { GetProcessStatusPayloadDto } from '../models/messaging-dtos/get-process-status-payload.dto';
import { GetRuralProducerPayloadDto } from '../models/messaging-dtos/get-rural-producer-payload.dto';
import { GetUserByEmailPayloadDto } from '../models/messaging-dtos/get-user-by-email-payload.dto';
import { GetUserByIdPayloadDto } from '../models/messaging-dtos/get-user-by-id-payload.dto';
import { RemovePlantingPayloadDto } from '../models/messaging-dtos/remove-planting-payload.dto';
import { UpdateRuralProducerPayloadDto } from '../models/messaging-dtos/update-rural-producer-payload.dto';
import { UpdateUserPayloadDto } from '../models/messaging-dtos/update-user-payload.dto';
import { ValidateUserPayloadDto } from '../models/messaging-dtos/validate-user-payload.dto';
import { CommandExecutionResultDto } from '../models/results-dtos/command-execution-result.dto';
import { CropsDistributionResultDto } from '../models/results-dtos/crops-distribution-result.dto';
import { DashboardMetricsResultDto } from '../models/results-dtos/dashboard-metrics-result.dto';
import { FarmsByStateResultDto } from '../models/results-dtos/farms-by-state-result.dto';
import { GetProcessStatusResultDto } from '../models/results-dtos/get-process-status-result.dto';
import { GetRuralProducerResultDto } from '../models/results-dtos/get-rural-producer-result.dto';
import { LandUseResultDto } from '../models/results-dtos/land-use-result.dto';
import { ListRuralProducersResultDto } from '../models/results-dtos/list-rural-producers-result.dto';
import { ListUsersResultDto } from '../models/results-dtos/list-users-result.dto';
import { UserResultDto } from '../models/results-dtos/user-result.dto';
import { ValidateUserResultDto } from '../models/results-dtos/validate-user-result.dto';
import { CropListResultDto } from '../models/results-dtos/crop-list-result.dto';
import { HarvestSeasonListResultDto } from '../models/results-dtos/harvest-season-list-result.dto';
import { NATS_SERVICE, NatsSubjects } from './nats-subjects';

interface NatsErrorResponse {
  status: 'error';
  error: string;
  message: string;
  timestamp: string;
}

function isNatsError(response: unknown): response is NatsErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    (response as { status: unknown }).status === 'error'
  );
}

@Injectable()
export class NatsPublisherService {
  private readonly logger = new Logger('NATS');

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  private send<T>(subject: string, data: unknown): Promise<T> {
    const start = Date.now();

    this.logger.log(`→ ${subject}`);

    return firstValueFrom(
      this.client
        .send<T | NatsErrorResponse>(subject, data)
        .pipe(
          tap({
            next: (res) => {
              const elapsed = Date.now() - start;
              if (isNatsError(res)) {
                this.logger.error(`← ${subject} ✗ ${res.error}: ${res.message} (${elapsed}ms)`);
              } else {
                this.logger.log(`← ${subject} ✓ (${elapsed}ms)`);
              }
            },
            error: (err: Error) => {
              const elapsed = Date.now() - start;
              this.logger.error(`← ${subject} ✗ ${err?.message ?? String(err)} (${elapsed}ms)`);
            },
          }),
          map((res) => {
            if (isNatsError(res)) {
              throw new BadRequestException(res.message);
            }
            return res as T;
          }),
        ),
    );
  }

  // ─── Commands ───────────────────────────────────────────────────────────────

  createRuralProducer(
    payload: CreateRuralProducerPayloadDto,
  ): Promise<CommandExecutionResultDto> {
    return this.send<CommandExecutionResultDto>(NatsSubjects.CREATE_RURAL_PRODUCER, payload);
  }

  updateRuralProducer(
    payload: UpdateRuralProducerPayloadDto,
  ): Promise<CommandExecutionResultDto> {
    return this.send<CommandExecutionResultDto>(NatsSubjects.UPDATE_RURAL_PRODUCER, payload);
  }

  deleteRuralProducer(
    payload: DeleteRuralProducerPayloadDto,
  ): Promise<CommandExecutionResultDto> {
    return this.send<CommandExecutionResultDto>(NatsSubjects.DELETE_RURAL_PRODUCER, payload);
  }

  addPlanting(payload: AddPlantingPayloadDto): Promise<CommandExecutionResultDto> {
    return this.send<CommandExecutionResultDto>(NatsSubjects.ADD_PLANTING, payload);
  }

  removePlanting(payload: RemovePlantingPayloadDto): Promise<CommandExecutionResultDto> {
    return this.send<CommandExecutionResultDto>(NatsSubjects.REMOVE_PLANTING, payload);
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  getRuralProducer(
    payload: GetRuralProducerPayloadDto,
  ): Promise<GetRuralProducerResultDto> {
    return this.send<GetRuralProducerResultDto>(NatsSubjects.GET_RURAL_PRODUCER, payload);
  }

  listRuralProducers(): Promise<ListRuralProducersResultDto> {
    return this.send<ListRuralProducersResultDto>(NatsSubjects.LIST_RURAL_PRODUCERS, new EmptyPayloadDto());
  }

  getProcessStatus(
    payload: GetProcessStatusPayloadDto,
  ): Promise<GetProcessStatusResultDto> {
    return this.send<GetProcessStatusResultDto>(NatsSubjects.GET_PROCESS_STATUS, payload);
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  getDashboardMetrics(): Promise<DashboardMetricsResultDto> {
    return this.send<DashboardMetricsResultDto>(NatsSubjects.DASHBOARD_METRICS, new EmptyPayloadDto());
  }

  getFarmsByState(): Promise<FarmsByStateResultDto> {
    return this.send<FarmsByStateResultDto>(NatsSubjects.DASHBOARD_FARMS_BY_STATE, new EmptyPayloadDto());
  }

  getCropsDistribution(): Promise<CropsDistributionResultDto> {
    return this.send<CropsDistributionResultDto>(NatsSubjects.DASHBOARD_CROPS_DISTRIBUTION, new EmptyPayloadDto());
  }

  getLandUse(): Promise<LandUseResultDto> {
    return this.send<LandUseResultDto>(NatsSubjects.DASHBOARD_LAND_USE, new EmptyPayloadDto());
  }

  // ─── Users ───────────────────────────────────────────────────────────────────

  createUser(payload: CreateUserPayloadDto): Promise<UserResultDto> {
    return this.send<UserResultDto>(NatsSubjects.CREATE_USER, payload);
  }

  updateUser(payload: UpdateUserPayloadDto): Promise<CommandExecutionResultDto> {
    return this.send<CommandExecutionResultDto>(NatsSubjects.UPDATE_USER, payload);
  }

  getUser(payload: GetUserByIdPayloadDto): Promise<UserResultDto> {
    return this.send<UserResultDto>(NatsSubjects.GET_USER, payload);
  }

  getUserByEmail(payload: GetUserByEmailPayloadDto): Promise<UserResultDto> {
    return this.send<UserResultDto>(NatsSubjects.GET_USER_BY_EMAIL, payload);
  }

  listUsers(): Promise<ListUsersResultDto> {
    return this.send<ListUsersResultDto>(NatsSubjects.LIST_USERS, new EmptyPayloadDto());
  }

  validateUser(payload: ValidateUserPayloadDto): Promise<ValidateUserResultDto> {
    return this.send<ValidateUserResultDto>(NatsSubjects.VALIDATE_USER, payload);
  }

  // ─── Reference data ──────────────────────────────────────────────────────────

  listCrops(): Promise<CropListResultDto> {
    return this.send<CropListResultDto>(NatsSubjects.LIST_CROPS, new EmptyPayloadDto());
  }

  listHarvestSeasons(): Promise<HarvestSeasonListResultDto> {
    return this.send<HarvestSeasonListResultDto>(NatsSubjects.LIST_HARVEST_SEASONS, new EmptyPayloadDto());
  }
}
