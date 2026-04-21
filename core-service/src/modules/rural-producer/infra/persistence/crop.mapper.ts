import { Crop } from '../../domain/entities/crop';

type PrismaCrop = {
  id: string;
  name: string;
};

export class CropMapper {
  static toDomain(raw: PrismaCrop): Crop {
    return new Crop(raw.id, raw.name);
  }

  static toPrisma(crop: Crop): PrismaCrop {
    return {
      id: crop.id,
      name: crop.name,
    };
  }
}
