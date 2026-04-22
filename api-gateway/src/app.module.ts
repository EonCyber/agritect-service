import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HealthController } from './controllers/health.controller';
import { RuralController } from './controllers/rural.controller';
import { MessagingModule } from './messaging/messaging.module';
import { RuralProducerService } from './services/rural-producer.service';

@Module({
  imports: [MessagingModule, AuthModule],
  controllers: [HealthController, RuralController],
  providers: [
    RuralProducerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
