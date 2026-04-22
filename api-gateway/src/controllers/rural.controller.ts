import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
import { RuralProducerService } from '../services/rural-producer.service';
import { AddPlantingRequestDto } from './dto/add-planting-request.dto';
import { CreateRuralProducerRequestDto } from './dto/create-rural-producer-request.dto';
import { RemovePlantingRequestDto } from './dto/remove-planting-request.dto';
import { UpdateRuralProducerRequestDto } from './dto/update-rural-producer-request.dto';

@ApiTags('rural')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rural')
export class RuralController {
  constructor(private readonly ruralProducerService: RuralProducerService) {}

  // ─── Commands ────────────────────────────────────────────────────────────────

  @Post('producer')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Create a rural producer (async command)' })
  @ApiBody({ type: CreateRuralProducerRequestDto })
  @ApiResponse({ status: 202, description: 'Command accepted', type: CommandExecutionResultDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  createRuralProducer(
    @Body() dto: CreateRuralProducerRequestDto,
  ): Promise<CommandExecutionResultDto> {
    return this.ruralProducerService.createRuralProducer(
      dto.taxId,
      dto.taxIdType,
      dto.name,
    );
  }

  @Put('producer/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Update a rural producer (async command)' })
  @ApiParam({ name: 'id', description: 'Rural producer ID' })
  @ApiBody({ type: UpdateRuralProducerRequestDto })
  @ApiResponse({ status: 202, description: 'Command accepted', type: CommandExecutionResultDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  updateRuralProducer(
    @Param('id') id: string,
    @Body() dto: UpdateRuralProducerRequestDto,
  ): Promise<CommandExecutionResultDto> {
    return this.ruralProducerService.updateRuralProducer(id, dto.name);
  }

  @Delete('producer/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Delete a rural producer (async command)' })
  @ApiParam({ name: 'id', description: 'Rural producer ID' })
  @ApiResponse({ status: 202, description: 'Command accepted', type: CommandExecutionResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  deleteRuralProducer(@Param('id') id: string): Promise<CommandExecutionResultDto> {
    return this.ruralProducerService.deleteRuralProducer(id);
  }

  @Post('producer/:id/planting')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Add a planting to a rural producer farm (async command)' })
  @ApiParam({ name: 'id', description: 'Rural producer ID' })
  @ApiBody({ type: AddPlantingRequestDto })
  @ApiResponse({ status: 202, description: 'Command accepted', type: CommandExecutionResultDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  addPlanting(
    @Param('id') ruralProducerId: string,
    @Body() dto: AddPlantingRequestDto,
  ): Promise<CommandExecutionResultDto> {
    return this.ruralProducerService.addPlanting(
      ruralProducerId,
      dto.farmId,
      dto.cropId,
      dto.harvestSeasonId,
    );
  }

  @Delete('producer/:id/planting')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Remove a planting from a rural producer farm (async command)' })
  @ApiParam({ name: 'id', description: 'Rural producer ID' })
  @ApiBody({ type: RemovePlantingRequestDto })
  @ApiResponse({ status: 202, description: 'Command accepted', type: CommandExecutionResultDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  removePlanting(
    @Param('id') ruralProducerId: string,
    @Body() dto: RemovePlantingRequestDto,
  ): Promise<CommandExecutionResultDto> {
    return this.ruralProducerService.removePlanting(
      ruralProducerId,
      dto.farmId,
      dto.cropId,
      dto.harvestSeasonId,
    );
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  @Get('producer')
  @ApiOperation({ summary: 'List all rural producers' })
  @ApiResponse({ status: 200, description: 'List of rural producers', type: ListRuralProducersResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 504, description: 'Core service timeout' })
  listRuralProducers(): Promise<ListRuralProducersResultDto> {
    return this.ruralProducerService.listRuralProducers();
  }

  @Get('producer/:id')
  @ApiOperation({ summary: 'Get a rural producer by ID' })
  @ApiParam({ name: 'id', description: 'Rural producer ID' })
  @ApiResponse({ status: 200, description: 'Rural producer data', type: GetRuralProducerResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not found' })
  getRuralProducer(@Param('id') id: string): Promise<GetRuralProducerResultDto> {
    return this.ruralProducerService.getRuralProducer(id);
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  @Get('dashboard/metrics')
  @ApiOperation({ summary: 'Get dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics', type: DashboardMetricsResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getDashboardMetrics(): Promise<DashboardMetricsResultDto> {
    return this.ruralProducerService.getDashboardMetrics();
  }

  @Get('dashboard/farms-by-state')
  @ApiOperation({ summary: 'Get farms distribution by state' })
  @ApiResponse({ status: 200, description: 'Farms by state', type: FarmsByStateResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getFarmsByState(): Promise<FarmsByStateResultDto> {
    return this.ruralProducerService.getFarmsByState();
  }

  @Get('dashboard/crops-distribution')
  @ApiOperation({ summary: 'Get crops distribution' })
  @ApiResponse({ status: 200, description: 'Crops distribution', type: CropsDistributionResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getCropsDistribution(): Promise<CropsDistributionResultDto> {
    return this.ruralProducerService.getCropsDistribution();
  }

  @Get('dashboard/land-use')
  @ApiOperation({ summary: 'Get land use breakdown' })
  @ApiResponse({ status: 200, description: 'Land use data', type: LandUseResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getLandUse(): Promise<LandUseResultDto> {
    return this.ruralProducerService.getLandUse();
  }

  // ─── Reference data ──────────────────────────────────────────────────────────

  @Get('crop')
  @ApiOperation({ summary: 'List available crops' })
  @ApiResponse({ status: 200, description: 'Crop list', type: CropListResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  listCrops(): Promise<CropListResultDto> {
    return this.ruralProducerService.listCrops();
  }

  @Get('harvest-season')
  @ApiOperation({ summary: 'List available harvest seasons' })
  @ApiResponse({ status: 200, description: 'Harvest season list', type: HarvestSeasonListResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  listHarvestSeasons(): Promise<HarvestSeasonListResultDto> {
    return this.ruralProducerService.listHarvestSeasons();
  }

  // ─── Process ─────────────────────────────────────────────────────────────────

  @Get('process/:processId')
  @ApiOperation({ summary: 'Get async process status' })
  @ApiParam({ name: 'processId', description: 'Process ID returned by an async command' })
  @ApiResponse({ status: 200, description: 'Process status', type: GetProcessStatusResultDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Process not found' })
  getProcessStatus(
    @Param('processId') processId: string,
  ): Promise<GetProcessStatusResultDto> {
    return this.ruralProducerService.getProcessStatus(processId);
  }
}
