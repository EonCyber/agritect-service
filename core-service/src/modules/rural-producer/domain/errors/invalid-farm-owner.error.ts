import { DomainError } from './domain.error';

export class InvalidFarmOwnerError extends DomainError {
  constructor(farmId: string, ruralProducerId: string) {
    super(`Farm ${farmId} does not belong to rural producer ${ruralProducerId}.`);
  }
}
