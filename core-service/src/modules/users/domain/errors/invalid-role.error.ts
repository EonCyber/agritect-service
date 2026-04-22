export class InvalidRoleError extends Error {
  constructor(role: string) {
    super(`Invalid role: ${role}. Allowed roles are: admin, user`);
    this.name = 'InvalidRoleError';
  }
}
