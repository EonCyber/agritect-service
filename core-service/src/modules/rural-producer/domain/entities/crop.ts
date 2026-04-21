import { InvalidCropNameError } from '../errors/invalid-crop-name.error';

export class Crop {
  private static readonly MIN_NAME_LENGTH = 2;

  public readonly id: string;
  public readonly name: string;

  constructor(id: string, name: string) {
    this.validateName(name);
    this.id = id;
    this.name = name.trim();
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < Crop.MIN_NAME_LENGTH) {
      throw new InvalidCropNameError(Crop.MIN_NAME_LENGTH);
    }
  }
}
