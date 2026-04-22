import { Injectable } from '@nestjs/common';
import { CropReadPort, CropListItem } from '../../app/ports/crop-read.port';
import { PrismaCropRepository } from '../../infra/persistence/prisma-crop.repository';

@Injectable()
export class CropReadAdapter implements CropReadPort {
  constructor(private readonly repo: PrismaCropRepository) {}

  async list(): Promise<CropListItem[]> {
    const crops = await this.repo.list();
    return crops.map((c) => ({ id: c.id, name: c.name }));
  }
}
