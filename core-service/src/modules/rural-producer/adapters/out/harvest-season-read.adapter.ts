import { Injectable } from '@nestjs/common';
import { HarvestSeasonReadPort, HarvestSeasonListItem } from '../../app/ports/harvest-season-read.port';
import { PrismaHarvestSeasonRepository } from '../../infra/persistence/prisma-harvest-season.repository';

@Injectable()
export class HarvestSeasonReadAdapter implements HarvestSeasonReadPort {
  constructor(private readonly repo: PrismaHarvestSeasonRepository) {}

  async list(): Promise<HarvestSeasonListItem[]> {
    const seasons = await this.repo.list();
    return seasons.map((s) => ({ id: s.id, year: s.year }));
  }
}
