import { Crop } from '../../domain/entities/crop';

export interface CropRepositoryPort {
  save(crop: Crop): Promise<void>;
  findById(id: string): Promise<Crop | null>;
  list(): Promise<Crop[]>;
  delete(id: string): Promise<void>;
}
