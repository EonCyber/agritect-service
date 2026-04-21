import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma.service';
import {
  DashboardMetrics,
  FarmsByStateItem,
  CropsDistributionItem,
  LandUseMetrics,
} from '../../app/ports/dashboard-read.port';

@Injectable()
export class PrismaDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(): Promise<DashboardMetrics> {
    const [totalFarms, aggregate] = await Promise.all([
      this.prisma.farm.count(),
      this.prisma.farm.aggregate({ _sum: { totalAreaHectares: true } }),
    ]);

    return {
      totalFarms,
      totalHectares: aggregate._sum.totalAreaHectares ?? 0,
    };
  }

  async getFarmsByState(): Promise<FarmsByStateItem[]> {
    const rows = await this.prisma.farm.groupBy({
      by: ['state'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return rows.map((r) => ({
      state: r.state,
      farmsCount: r._count.id,
    }));
  }

  async getCropsDistribution(): Promise<CropsDistributionItem[]> {
    const rows = await this.prisma.planting.groupBy({
      by: ['cropId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const cropIds = rows.map((r) => r.cropId);
    const crops = await this.prisma.crop.findMany({
      where: { id: { in: cropIds } },
      select: { id: true, name: true },
    });

    const cropMap = new Map(crops.map((c) => [c.id, c.name]));

    return rows.map((r) => ({
      cropId: r.cropId,
      cropName: cropMap.get(r.cropId) ?? r.cropId,
      plantingsCount: r._count.id,
    }));
  }

  async getLandUse(): Promise<LandUseMetrics> {
    const aggregate = await this.prisma.farm.aggregate({
      _sum: {
        totalAreaHectares: true,
        arableAreaHectares: true,
        vegetationAreaHectares: true,
      },
    });

    const total = aggregate._sum.totalAreaHectares ?? 0;
    const arable = aggregate._sum.arableAreaHectares ?? 0;
    const vegetation = aggregate._sum.vegetationAreaHectares ?? 0;

    return {
      totalArableAreaHectares: arable,
      totalVegetationAreaHectares: vegetation,
      totalOtherAreaHectares: total - arable - vegetation,
    };
  }
}
