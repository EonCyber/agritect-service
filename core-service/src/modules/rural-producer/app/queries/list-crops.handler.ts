import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ListCropsQuery } from './interfaces/list-crops.query';
import type { CropReadPort, CropListItem } from '../ports/crop-read.port';

export const CROP_READ = 'CROP_READ';

@QueryHandler(ListCropsQuery)
export class ListCropsQueryHandler
  implements IQueryHandler<ListCropsQuery, CropListItem[]>
{
  constructor(
    @Inject(CROP_READ)
    private readonly cropRead: CropReadPort,
  ) {}

  execute(_query: ListCropsQuery): Promise<CropListItem[]> {
    return this.cropRead.list();
  }
}
