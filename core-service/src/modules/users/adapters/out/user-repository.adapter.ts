import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { User } from '../../domain/entities/user';
import { UserRepositoryPort } from '../../app/ports/user-repository.port';
import { PrismaUserRepository } from '../../infra/persistence/prisma-user.repository';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { DuplicateEmailError } from '../../domain/errors/duplicate-email.error';

@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
  constructor(private readonly repo: PrismaUserRepository) {}

  async save(user: User): Promise<void> {
    try {
      return await this.repo.save(user);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new DuplicateEmailError(user.email);
      }
      throw err;
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findByEmail(email);
  }

  async delete(id: string): Promise<void> {
    try {
      return await this.repo.delete(id);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new UserNotFoundError(id);
      }
      throw err;
    }
  }
}
