export class AuthResponseDto {
  accessToken!: string;
  tokenType!: string;
  expiresIn!: number;
  user!: {
    id: string;
    email: string;
    username: string;
    roles: string[];
  };
}
