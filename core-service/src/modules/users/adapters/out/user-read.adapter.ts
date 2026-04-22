import { Injectable } from '@nestjs/common';
import { UserReadPort, UserReadModel, UserListItem } from '../../app/ports/user-read.port';
import { PrismaUserRepository } from '../../infra/persistence/prisma-user.repository';

@Injectable()
export class UserReadAdapter implements UserReadPort {
  constructor(private readonly repo: PrismaUserRepository) {}

  findById(id: string): Promise<UserReadModel | null> {
    return this.repo.findByIdForRead(id);
  }

  findByEmail(email: string): Promise<UserReadModel | null> {
    return this.repo.findByEmailForRead(email);
  }

  list(): Promise<UserListItem[]> {
    return this.repo.list();
  }
}
