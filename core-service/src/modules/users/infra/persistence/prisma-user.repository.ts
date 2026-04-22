import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/prisma.service';
import { User } from '../../domain/entities/user';
import { UserMapper } from './user.mapper';
import { UserReadModel, UserListItem } from '../../app/ports/user-read.port';

@Injectable()
export class PrismaUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<void> {
    const data = UserMapper.toPrisma(user);
    const { id: _id, createdAt: _createdAt, ...updateData } = data;
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: data,
      update: updateData,
    });
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return UserMapper.toDomain(row);
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email || email.trim().length === 0) {
      return null;
    }
    const row = await this.prisma.user.findUnique({ where: { email } });
    if (!row) return null;
    return UserMapper.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findByIdForRead(id: string): Promise<UserReadModel | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return UserMapper.toReadModel(row);
  }

  async findByEmailForRead(email: string): Promise<UserReadModel | null> {
    if (!email || email.trim().length === 0) {
      return null;
    }
    const row = await this.prisma.user.findUnique({ where: { email } });
    if (!row) return null;
    return UserMapper.toReadModel(row);
  }

  async list(): Promise<UserListItem[]> {
    const rows = await this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map((r) => UserMapper.toListItem(r));
  }
}
