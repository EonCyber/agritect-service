import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma.service';
import { RuralProducer, TaxIdType } from '../../domain/entities/rural-producer';
import { RuralProducerMapper } from './rural-produce.mapper';
import { FarmMapper } from './farm.mapper';
import {
  RuralProducerReadModel,
  RuralProducerListItem,
} from '../../app/ports/rural-producer-read.port';

@Injectable()
export class PrismaRuralProducerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(producer: RuralProducer): Promise<void> {
    const producerData = RuralProducerMapper.toPrisma(producer);
    const farmIds = producer.farms.map((f) => f.id);

    await this.prisma.$transaction(async (tx) => {
      const { id: _id, ...producerUpdateData } = producerData;
      await tx.ruralProducer.upsert({
        where: { id: producer.id },
        create: producerData,
        update: producerUpdateData,
      });

      const farmsToRemove = await tx.farm.findMany({
        where: { ruralProducerId: producer.id, id: { notIn: farmIds } },
        select: { id: true },
      });

      if (farmsToRemove.length > 0) {
        const removedIds = farmsToRemove.map((f) => f.id);
        await tx.planting.deleteMany({ where: { farmId: { in: removedIds } } });
        await tx.farm.deleteMany({ where: { id: { in: removedIds } } });
      }

      for (const farm of producer.farms) {
        const farmData = FarmMapper.toPrisma(farm);
        const { id: _fid, ruralProducerId: _rpi, ...farmUpdateData } = farmData;
        await tx.farm.upsert({
          where: { id: farm.id },
          create: farmData,
          update: farmUpdateData,
        });

        await tx.planting.deleteMany({ where: { farmId: farm.id } });
        for (const planting of farm.plantings) {
          await tx.planting.create({
            data: {
              farmId: farm.id,
              cropId: planting.cropId,
              harvestSeasonId: planting.harvestSeasonId,
            },
          });
        }
      }
    });
  }

  async findById(id: string): Promise<RuralProducer | null> {
    const raw = await this.prisma.ruralProducer.findUnique({
      where: { id },
      include: { farms: { include: { plantings: true } } },
    });

    if (!raw) return null;
    return RuralProducerMapper.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const farms = await tx.farm.findMany({
        where: { ruralProducerId: id },
        select: { id: true },
      });

      if (farms.length > 0) {
        const farmIds = farms.map((f) => f.id);
        await tx.planting.deleteMany({ where: { farmId: { in: farmIds } } });
        await tx.farm.deleteMany({ where: { ruralProducerId: id } });
      }

      await tx.ruralProducer.delete({ where: { id } });
    });
  }

  async findByIdForRead(id: string): Promise<RuralProducerReadModel | null> {
    const raw = await this.prisma.ruralProducer.findUnique({
      where: { id },
      include: {
        farms: {
          include: {
            plantings: {
              include: { crop: true, harvestSeason: true },
            },
          },
        },
      },
    });

    if (!raw) return null;

    return {
      id: raw.id,
      taxId: raw.taxId,
      taxIdType: raw.taxIdType as TaxIdType,
      name: raw.name,
      farms: raw.farms.map((farm) => ({
        id: farm.id,
        name: farm.name,
        city: farm.city,
        state: farm.state,
        totalAreaHectares: farm.totalAreaHectares,
        arableAreaHectares: farm.arableAreaHectares,
        vegetationAreaHectares: farm.vegetationAreaHectares,
        plantings: farm.plantings.map((p) => ({
          cropId: p.cropId,
          cropName: p.crop.name,
          harvestSeasonId: p.harvestSeasonId,
          harvestSeasonYear: p.harvestSeason.year,
        })),
      })),
    };
  }

  async list(): Promise<RuralProducerListItem[]> {
    const rows = await this.prisma.ruralProducer.findMany({
      include: { _count: { select: { farms: true } } },
    });

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      taxId: r.taxId,
      farmsCount: r._count.farms,
    }));
  }
}
