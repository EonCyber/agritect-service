import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma.service';
import { Crop } from '../../domain/entities/crop';
import { CropMapper } from './crop.mapper';

@Injectable()
export class PrismaCropRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(crop: Crop): Promise<void> {
    const data = CropMapper.toPrisma(crop);
    const { id: _id, ...updateData } = data;
    await this.prisma.crop.upsert({
      where: { id: crop.id },
      create: data,
      update: updateData,
    });
  }

  async findById(id: string): Promise<Crop | null> {
    const raw = await this.prisma.crop.findUnique({ where: { id } });
    if (!raw) return null;
    return CropMapper.toDomain(raw);
  }

  async list(): Promise<Crop[]> {
    const rows = await this.prisma.crop.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r) => CropMapper.toDomain(r));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.crop.delete({ where: { id } });
  }
}
