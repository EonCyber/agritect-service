import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma.service';
import { HarvestSeason } from '../../domain/entities/harvest-season';
import { HarvestSeasonMapper } from './harvest-season.mapper';

@Injectable()
export class PrismaHarvestSeasonRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(harvestSeason: HarvestSeason): Promise<void> {
    const data = HarvestSeasonMapper.toPrisma(harvestSeason);
    const { id: _id, ...updateData } = data;
    await this.prisma.harvestSeason.upsert({
      where: { id: harvestSeason.id },
      create: data,
      update: updateData,
    });
  }

  async findById(id: string): Promise<HarvestSeason | null> {
    const raw = await this.prisma.harvestSeason.findUnique({ where: { id } });
    if (!raw) return null;
    return HarvestSeasonMapper.toDomain(raw);
  }

  async list(): Promise<HarvestSeason[]> {
    const rows = await this.prisma.harvestSeason.findMany({
      orderBy: { year: 'asc' },
    });
    return rows.map((r) => HarvestSeasonMapper.toDomain(r));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.harvestSeason.delete({ where: { id } });
  }
}
