export class InvalidPasswordError extends Error {
  constructor(minLength: number = 6) {
    super(`Password must have at least ${minLength} characters`);
    this.name = 'InvalidPasswordError';
  }
}
