import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { GetUserByIdPayloadDto } from '../models/messaging-dtos/get-user-by-id-payload.dto';
import { NatsPublisherService } from '../messaging/nats-publisher.service';

interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly publisher: NatsPublisherService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const getPayload = new GetUserByIdPayloadDto();
    getPayload.id = payload.sub;

    const user = await this.publisher.getUser(getPayload).catch(() => {
      throw new UnauthorizedException();
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!user.active) {
      throw new UnauthorizedException('User account is inactive');
    }

    return {
      userId: user.id,
      email: user.email,
      roles: user.roles,
    };
  }
}

