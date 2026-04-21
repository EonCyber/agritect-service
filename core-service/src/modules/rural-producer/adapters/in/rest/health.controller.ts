import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export class HealthResponseDto {
  status!: string;
  timestamp!: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Retorna o status do serviço e o timestamp atual' })
  @ApiResponse({ status: 200, description: 'Serviço operacional', type: HealthResponseDto })
  check(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
