import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MessagingModule } from '../../shared/messaging.module';
import { PrismaService } from '../../shared/prisma.service';
import { PrismaRuralProducerRepository } from './infra/persistence/prisma-rural-producer.repository';
import { PrismaCropRepository } from './infra/persistence/prisma-crop.repository';
import { PrismaHarvestSeasonRepository } from './infra/persistence/prisma-harvest-season.repository';
import { PrismaDashboardRepository } from './infra/persistence/prisma-dashboard.repository';
import { RuralProducerRepositoryAdapter } from './adapters/out/rural-producer-repository.adapter';
import { RuralProducerReadAdapter } from './adapters/out/rural-producer-read.adapter';
import { CropRepositoryAdapter } from './adapters/out/crop-repository.adapter';
import { HarvestSeasonRepositoryAdapter } from './adapters/out/harvest-season-repository.adapter';
import { DashboardReadAdapter, DASHBOARD_READ } from './adapters/out/dashboard-read.adapter';
import { CropReadAdapter } from './adapters/out/crop-read.adapter';
import { HarvestSeasonReadAdapter } from './adapters/out/harvest-season-read.adapter';
import {
  CreateRuralProducerCommandHandler,
  RURAL_PRODUCER_REPOSITORY,
} from './app/commands/create-rural-producer.handler';
import { UpdateRuralProducerCommandHandler } from './app/commands/update-rural-producer.handler';
import { DeleteRuralProducerCommandHandler } from './app/commands/delete-rural-producer.handler';
import { AddPlantingCommandHandler } from './app/commands/add-planting.handler';
import { RemovePlantingCommandHandler } from './app/commands/remove-planting.handler';
import {
  GetRuralProducerQueryHandler,
  RURAL_PRODUCER_READ,
} from './app/queries/get-rural-producer.handler';
import { ListRuralProducersQueryHandler } from './app/queries/list-rural-producers.handler';
import { GetDashboardMetricsQueryHandler } from './app/queries/get-dashboard-metrics.handler';
import { GetFarmsByStateQueryHandler } from './app/queries/get-farms-by-state.handler';
import { GetCropsDistributionQueryHandler } from './app/queries/get-crops-distribution.handler';
import { GetLandUseQueryHandler } from './app/queries/get-land-use.handler';
import {
  GetProcessStatusQueryHandler,
  PROCESS_REPOSITORY,
} from './app/queries/get-process-status.handler';
import {
  ListCropsQueryHandler,
  CROP_READ,
} from './app/queries/list-crops.handler';
import {
  ListHarvestSeasonsQueryHandler,
  HARVEST_SEASON_READ,
} from './app/queries/list-harvest-seasons.handler';
import { PrismaCommandExecutionRepository } from './infra/persistence/prisma-command-execution.repository';
import { ProcessRepositoryAdapter } from './adapters/out/process-repository.adapter';
import { CreateRuralProducerConsumer } from './adapters/in/messaging/create-rural-producer.consumer';
import { UpdateRuralProducerConsumer } from './adapters/in/messaging/update-rural-producer.consumer';
import { DeleteRuralProducerConsumer } from './adapters/in/messaging/delete-rural-producer.consumer';
import { AddPlantingConsumer } from './adapters/in/messaging/add-planting.consumer';
import { RemovePlantingConsumer } from './adapters/in/messaging/remove-planting.consumer';
import { GetRuralProducerConsumer } from './adapters/in/messaging/get-rural-producer.consumer';
import { ListRuralProducersConsumer } from './adapters/in/messaging/list-rural-producers.consumer';
import { GetDashboardMetricsConsumer } from './adapters/in/messaging/get-dashboard-metrics.consumer';
import { GetFarmsByStateConsumer } from './adapters/in/messaging/get-farms-by-state.consumer';
import { GetCropsDistributionConsumer } from './adapters/in/messaging/get-crops-distribution.consumer';
import { GetLandUseConsumer } from './adapters/in/messaging/get-land-use.consumer';
import { GetProcessStatusConsumer } from './adapters/in/messaging/get-process-status.consumer';
import { ListCropsConsumer } from './adapters/in/messaging/list-crops.consumer';
import { ListHarvestSeasonsConsumer } from './adapters/in/messaging/list-harvest-seasons.consumer';
import { HealthController } from './adapters/in/rest/health.controller';

const commandHandlers = [
  CreateRuralProducerCommandHandler,
  UpdateRuralProducerCommandHandler,
  DeleteRuralProducerCommandHandler,
  AddPlantingCommandHandler,
  RemovePlantingCommandHandler,
];

const queryHandlers = [
  GetRuralProducerQueryHandler,
  ListRuralProducersQueryHandler,
  GetDashboardMetricsQueryHandler,
  GetFarmsByStateQueryHandler,
  GetCropsDistributionQueryHandler,
  GetLandUseQueryHandler,
  GetProcessStatusQueryHandler,
  ListCropsQueryHandler,
  ListHarvestSeasonsQueryHandler,
];

const commandConsumers = [
  CreateRuralProducerConsumer,
  UpdateRuralProducerConsumer,
  DeleteRuralProducerConsumer,
  AddPlantingConsumer,
  RemovePlantingConsumer,
];

const queryConsumers = [
  GetRuralProducerConsumer,
  ListRuralProducersConsumer,
  GetDashboardMetricsConsumer,
  GetFarmsByStateConsumer,
  GetCropsDistributionConsumer,
  GetLandUseConsumer,
  GetProcessStatusConsumer,
  ListCropsConsumer,
  ListHarvestSeasonsConsumer,
];

@Module({
  imports: [CqrsModule, MessagingModule],
  controllers: [
    HealthController,
    ...commandConsumers,
    ...queryConsumers,
  ],
  providers: [
    PrismaService,
    PrismaRuralProducerRepository,
    PrismaCropRepository,
    PrismaHarvestSeasonRepository,
    PrismaDashboardRepository,
    PrismaCommandExecutionRepository,
    RuralProducerRepositoryAdapter,
    { provide: RURAL_PRODUCER_REPOSITORY, useExisting: RuralProducerRepositoryAdapter },
    RuralProducerReadAdapter,
    { provide: RURAL_PRODUCER_READ, useExisting: RuralProducerReadAdapter },
    CropRepositoryAdapter,
    HarvestSeasonRepositoryAdapter,
    DashboardReadAdapter,
    { provide: DASHBOARD_READ, useExisting: DashboardReadAdapter },
    CropReadAdapter,
    { provide: CROP_READ, useExisting: CropReadAdapter },
    HarvestSeasonReadAdapter,
    { provide: HARVEST_SEASON_READ, useExisting: HarvestSeasonReadAdapter },
    ProcessRepositoryAdapter,
    { provide: PROCESS_REPOSITORY, useExisting: ProcessRepositoryAdapter },
    ...commandHandlers,
    ...queryHandlers,
  ],
})
export class RuralProducerModule {}
