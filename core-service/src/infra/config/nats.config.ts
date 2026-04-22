import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SafeNatsDeserializer } from '../../shared/safe-nats-deserializer';

export const natsConfig: MicroserviceOptions = {
  transport: Transport.NATS,
  options: {
    servers: [process.env.NATS_URL ?? 'nats://localhost:4222'],
    queue: 'rural-producer-service',
    deserializer: new SafeNatsDeserializer(),
  },
};
