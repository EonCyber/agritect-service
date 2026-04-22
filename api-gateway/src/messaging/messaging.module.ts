import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NatsPublisherService } from './nats-publisher.service';
import { NATS_SERVICE } from './nats-subjects';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NATS_SERVICE,
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_URL ?? 'nats://localhost:4222'],
        },
      },
    ]),
  ],
  providers: [NatsPublisherService],
  exports: [NatsPublisherService],
})
export class MessagingModule {}
