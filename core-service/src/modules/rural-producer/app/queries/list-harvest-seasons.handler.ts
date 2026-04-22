import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListHarvestSeasonsQuery } from './interfaces/list-harvest-seasons.query';
import type { HarvestSeasonReadPort, HarvestSeasonListItem } from '../ports/harvest-season-read.port';

export const HARVEST_SEASON_READ = 'HARVEST_SEASON_READ';

@QueryHandler(ListHarvestSeasonsQuery)
export class ListHarvestSeasonsQueryHandler
  implements IQueryHandler<ListHarvestSeasonsQuery, HarvestSeasonListItem[]>
{
  constructor(
    @Inject(HARVEST_SEASON_READ)
    private readonly harvestSeasonRead: HarvestSeasonReadPort,
  ) {}

  execute(_query: ListHarvestSeasonsQuery): Promise<HarvestSeasonListItem[]> {
    return this.harvestSeasonRead.list();
  }
}
