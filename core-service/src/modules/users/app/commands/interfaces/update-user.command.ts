export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly active: boolean,
    public readonly roles: string[],
  ) {}
}
