import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MessagingModule } from '../../shared/messaging.module';
import { PrismaService } from '../../shared/prisma.service';
import { PrismaUserRepository } from './infra/persistence/prisma-user.repository';
import { PrismaCommandExecutionRepository } from '../rural-producer/infra/persistence/prisma-command-execution.repository';
import { UserRepositoryAdapter } from './adapters/out/user-repository.adapter';
import { UserReadAdapter } from './adapters/out/user-read.adapter';
import { UserProcessRepositoryAdapter, PROCESS_REPOSITORY } from './adapters/out/process-repository.adapter';
import {
  CreateUserCommandHandler,
  USER_REPOSITORY,
} from './app/commands/create-user.handler';
import { UpdateUserCommandHandler } from './app/commands/update-user.handler';
import { ValidateUserCommandHandler } from './app/commands/validate-user.handler';
import {
  GetUserByIdQueryHandler,
  USER_READ,
} from './app/queries/get-user-by-id.handler';
import { GetUserByEmailQueryHandler } from './app/queries/get-user-by-email.handler';
import { ListUsersQueryHandler } from './app/queries/list-users.handler';
import { CreateUserConsumer } from './adapters/in/messaging/create-user.consumer';
import { UpdateUserConsumer } from './adapters/in/messaging/update-user.consumer';
import { ValidateUserConsumer } from './adapters/in/messaging/validate-user.consumer';
import { GetUserByIdConsumer } from './adapters/in/messaging/get-user-by-id.consumer';
import { GetUserByEmailConsumer } from './adapters/in/messaging/get-user-by-email.consumer';
import { ListUsersConsumer } from './adapters/in/messaging/list-users.consumer';

const commandHandlers = [
  CreateUserCommandHandler,
  UpdateUserCommandHandler,
  ValidateUserCommandHandler,
];

const queryHandlers = [
  GetUserByIdQueryHandler,
  GetUserByEmailQueryHandler,
  ListUsersQueryHandler,
];

const commandConsumers = [
  CreateUserConsumer,
  UpdateUserConsumer,
  ValidateUserConsumer,
];

const queryConsumers = [
  GetUserByIdConsumer,
  GetUserByEmailConsumer,
  ListUsersConsumer,
];

@Module({
  imports: [CqrsModule, MessagingModule],
  providers: [
    PrismaService,
    PrismaUserRepository,
    PrismaCommandExecutionRepository,
    UserRepositoryAdapter,
    { provide: USER_REPOSITORY, useExisting: UserRepositoryAdapter },
    UserReadAdapter,
    { provide: USER_READ, useExisting: UserReadAdapter },
    UserProcessRepositoryAdapter,
    { provide: PROCESS_REPOSITORY, useExisting: UserProcessRepositoryAdapter },
    ...commandHandlers,
    ...queryHandlers,
  ],
  controllers: [
    ...commandConsumers,
    ...queryConsumers,
  ],
})
export class UsersModule {}
