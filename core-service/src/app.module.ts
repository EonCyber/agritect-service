import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { RuralProducerModule } from './modules/rural-producer/rural-producer.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaService } from './shared/prisma.service';
import { LoggingInterceptor } from './shared/logging.interceptor';
import { RpcExceptionFilter } from './shared/rpc-exception.filter';

@Module({
  imports: [RuralProducerModule, UsersModule],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter,
    },
  ],
})
export class AppModule {}
