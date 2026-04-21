import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HarvestSeason } from '../../domain/entities/harvest-season';
import { HarvestSeasonRepositoryPort } from '../../app/ports/harvest-season-repository.port';
import { PrismaHarvestSeasonRepository } from '../../infra/persistence/prisma-harvest-season.repository';
import { HarvestSeasonNotFoundError } from '../../domain/errors/harvest-season-not-found.error';
import { DuplicateHarvestSeasonYearError } from '../../domain/errors/duplicate-harvest-season-year.error';

@Injectable()
export class HarvestSeasonRepositoryAdapter implements HarvestSeasonRepositoryPort {
  constructor(private readonly repo: PrismaHarvestSeasonRepository) {}

  async save(harvestSeason: HarvestSeason): Promise<void> {
    try {
      return await this.repo.save(harvestSeason);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new DuplicateHarvestSeasonYearError(harvestSeason.year);
      }
      throw err;
    }
  }

  async findById(id: string): Promise<HarvestSeason | null> {
    return this.repo.findById(id);
  }

  async list(): Promise<HarvestSeason[]> {
    return this.repo.list();
  }

  async delete(id: string): Promise<void> {
    try {
      return await this.repo.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new HarvestSeasonNotFoundError(id);
      }
      throw err;
    }
  }
}
