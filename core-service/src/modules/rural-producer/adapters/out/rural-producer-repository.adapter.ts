import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RuralProducer } from '../../domain/entities/rural-producer';
import { RuralProducerRepositoryPort } from '../../app/ports/rural-producer-repository.port';
import { PrismaRuralProducerRepository } from '../../infra/persistence/prisma-rural-producer.repository';
import { RuralProducerNotFoundError } from '../../domain/errors/rural-producer-not-found.error';
import { DuplicateTaxIdError } from '../../domain/errors/duplicate-tax-id.error';

@Injectable()
export class RuralProducerRepositoryAdapter implements RuralProducerRepositoryPort {
  constructor(private readonly repo: PrismaRuralProducerRepository) {}

  async save(producer: RuralProducer): Promise<void> {
    try {
      return await this.repo.save(producer);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new DuplicateTaxIdError(producer.taxId);
      }
      throw err;
    }
  }

  async findById(id: string): Promise<RuralProducer | null> {
    return this.repo.findById(id);
  }

  async delete(id: string): Promise<void> {
    try {
      return await this.repo.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new RuralProducerNotFoundError(id);
      }
      throw err;
    }
  }
}
