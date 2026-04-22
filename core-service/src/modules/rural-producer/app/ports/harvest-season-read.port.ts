export interface HarvestSeasonListItem {
  id: string;
  year: number;
}

export interface HarvestSeasonReadPort {
  list(): Promise<HarvestSeasonListItem[]>;
}
