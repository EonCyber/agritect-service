export class RemovePlantingCommand {
  constructor(
    public readonly ruralProducerId: string,
    public readonly farmId: string,
    public readonly cropId: string,
    public readonly harvestSeasonId: string,
  ) {}
}
