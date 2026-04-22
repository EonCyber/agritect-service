import { User } from '../../domain/entities/user';
import { UserReadModel, UserListItem } from '../../app/ports/user-read.port';

type PrismaUser = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  active: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
};

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return new User(
      raw.id,
      raw.username,
      raw.email,
      raw.passwordHash,
      raw.active,
      raw.roles,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPrisma(user: User): PrismaUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      active: user.active,
      roles: [...user.roles],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toReadModel(raw: PrismaUser): UserReadModel {
    return {
      id: raw.id,
      username: raw.username,
      email: raw.email,
      active: raw.active,
      roles: raw.roles,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toListItem(raw: PrismaUser): UserListItem {
    return {
      id: raw.id,
      username: raw.username,
      email: raw.email,
      active: raw.active,
      roles: raw.roles,
    };
  }
}
