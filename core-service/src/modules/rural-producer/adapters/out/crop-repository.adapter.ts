import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Crop } from '../../domain/entities/crop';
import { CropRepositoryPort } from '../../app/ports/crop-repository.port';
import { PrismaCropRepository } from '../../infra/persistence/prisma-crop.repository';
import { CropNotFoundError } from '../../domain/errors/crop-not-found.error';
import { DuplicateCropNameError } from '../../domain/errors/duplicate-crop-name.error';

@Injectable()
export class CropRepositoryAdapter implements CropRepositoryPort {
  constructor(private readonly repo: PrismaCropRepository) {}

  async save(crop: Crop): Promise<void> {
    try {
      return await this.repo.save(crop);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new DuplicateCropNameError(crop.name);
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Crop | null> {
    return this.repo.findById(id);
  }

  async list(): Promise<Crop[]> {
    return this.repo.list();
  }

  async delete(id: string): Promise<void> {
    try {
      return await this.repo.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new CropNotFoundError(id);
      }
      throw err;
    }
  }
}
