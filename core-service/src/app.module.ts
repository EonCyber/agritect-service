import { Module } from '@nestjs/common';
import { RuralProducerModule } from './modules/rural-producer/rural-producer.module';
import { PrismaService } from './shared/prisma.service';

@Module({
  imports: [RuralProducerModule],
  controllers: [],
  providers: [
    PrismaService,
  ],
})
export class AppModule {}
