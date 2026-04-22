import { InvalidEmailError } from '../errors/invalid-email.error';
import { InvalidUsernameError } from '../errors/invalid-username.error';
import { InvalidPasswordHashError } from '../errors/invalid-password-hash.error';
import { InvalidRoleError } from '../errors/invalid-role.error';
import { UserRole, isValidRole } from '../enums/user-role.enum';

export class User {
  private static readonly MIN_USERNAME_LENGTH = 3;
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  public readonly id: string;
  public readonly username: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly active: boolean;
  public readonly roles: ReadonlyArray<UserRole>;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(
    id: string,
    username: string,
    email: string,
    passwordHash: string,
    active: boolean = true,
    roles: string[] = [UserRole.USER],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    this.validateUsername(username);
    this.validateEmail(email);
    this.validatePasswordHash(passwordHash);
    this.validateRoles(roles);

    this.id = id;
    this.username = username.trim();
    this.email = email.toLowerCase().trim();
    this.passwordHash = passwordHash;
    this.active = active;
    this.roles = roles as UserRole[];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  private validateUsername(username: string): void {
    if (!username || username.trim().length < User.MIN_USERNAME_LENGTH) {
      throw new InvalidUsernameError(User.MIN_USERNAME_LENGTH);
    }
  }

  private validateEmail(email: string): void {
    if (!email || !User.EMAIL_REGEX.test(email.trim())) {
      throw new InvalidEmailError(email);
    }
  }

  private validatePasswordHash(passwordHash: string): void {
    if (!passwordHash || passwordHash.trim().length === 0) {
      throw new InvalidPasswordHashError();
    }
  }

  private validateRoles(roles: string[]): void {
    for (const role of roles) {
      if (!isValidRole(role)) {
        throw new InvalidRoleError(role);
      }
    }
  }
}
