import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserPayloadDto } from '../models/messaging-dtos/create-user-payload.dto';
import { GetUserByEmailPayloadDto } from '../models/messaging-dtos/get-user-by-email-payload.dto';
import { ValidateUserPayloadDto } from '../models/messaging-dtos/validate-user-payload.dto';
import { ValidateUserResultDto } from '../models/results-dtos/validate-user-result.dto';
import { NatsPublisherService } from '../messaging/nats-publisher.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';

const TOKEN_EXPIRES_IN_SECONDS = 3600;

@Injectable()
export class AuthService {
  constructor(
    private readonly publisher: NatsPublisherService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(
    username: string,
    email: string,
    password: string,
  ): Promise<AuthResponseDto> {
    const getByEmailPayload = new GetUserByEmailPayloadDto();
    getByEmailPayload.email = email;

    const existing = await this.publisher
      .getUserByEmail(getByEmailPayload)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('no subscribers') || msg.includes('No responders')) {
          throw new InternalServerErrorException('Authentication service is unavailable');
        }
        // 'Empty response' = core-service returned null (user not found) — treat as no existing user
        return null;
      });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const createPayload = new CreateUserPayloadDto();
    createPayload.username = username;
    createPayload.email = email;
    createPayload.password = password;
    createPayload.roles = ['user'];

    const createdUser = await this.publisher.createUser(createPayload);

    return this.buildAuthResponse(
      createdUser.id,
      createdUser.email,
      createdUser.username,
      createdUser.roles,
    );
  }

  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.validate(email, password);

    return this.buildAuthResponse(user.id, user.email, '', user.roles);
  }

  async validate(email: string, password: string): Promise<ValidateUserResultDto> {
    const payload = new ValidateUserPayloadDto();
    payload.email = email;
    payload.password = password;

    const user = await this.publisher.validateUser(payload).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('no subscribers') || msg.includes('No responders')) {
        throw new UnauthorizedException('Authentication service is unavailable');
      }
      // 'Empty response' = user not found or invalid credentials
      throw new UnauthorizedException('Invalid credentials');
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.active) {
      throw new UnauthorizedException('User account is inactive');
    }

    return user;
  }

  logout(): LogoutResponseDto {
    // JWT is stateless — token invalidation is handled client-side by discarding the token.
    // This method is intentionally a no-op today but is structured to support:
    // - token blacklisting (e.g. Redis store)
    // - refresh token revocation
    // - audit logging
    const response = new LogoutResponseDto();
    response.message = 'Logged out successfully';
    return response;
  }

  private buildAuthResponse(
    id: string,
    email: string,
    username: string,
    roles: string[],
  ): AuthResponseDto {
    const tokenPayload = { sub: id, email, roles };
    const accessToken = this.jwtService.sign(tokenPayload);

    const response = new AuthResponseDto();
    response.accessToken = accessToken;
    response.tokenType = 'Bearer';
    response.expiresIn = TOKEN_EXPIRES_IN_SECONDS;
    response.user = { id, email, username, roles };
    return response;
  }
}
