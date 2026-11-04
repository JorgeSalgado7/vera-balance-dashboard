import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { JwtAuthProvider } from '../auth/infrastructure/providers/jwt-auth.provider'

import { CreateUserController } from './presentation/http/controllers/create-user.controller'
import { GetUsersController } from './presentation/http/controllers/get-users.controller'
import { GetUserByIdController } from './presentation/http/controllers/get-user-by-id.controller'
import { UpdateUserController } from './presentation/http/controllers/update-user.controller'
import { UpdateUserStatusController } from './presentation/http/controllers/update-user-status.controller'
import { DeleteUserController } from './presentation/http/controllers/delete-user.controller'
import { CreateUserUseCase } from './application/use-cases/create-user.use-case'
import { GetUsersUseCase } from './application/use-cases/get-users.use-case'
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case'
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case'
import { UpdateUserStatusUseCase } from './application/use-cases/update-user-status.use-case'
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case'

import { CreateUserDomainService } from './domain/services/create-user.domain-service'
import { ValidateCreateUserDomainService } from './domain/services/validate-create-user.domain-service'
import { ValidateGetUserByIdDomainService } from './domain/services/validate-get-user-by-id.domain-service'
import { ValidateUpdateUserAccessDomainService } from './domain/services/validate-update-user-access.domain-service'
import { UpdateUserDomainService } from './domain/services/update-user.domain-service'
import type { IUserRepository } from './domain/repositories/user.repository'
import type { IFindAllUsersRepository } from './domain/repositories/find-all-users.repository'
import type { IUpdateUserRepository } from './domain/repositories/update-user.repository'
import type { IUpdateUserStatusRepository } from './domain/repositories/update-user-status.repository'
import type { IDeleteUserRepository } from './domain/repositories/delete-user.repository'
import type { IUserTherapeuticProcessesRepository } from './domain/repositories/user-therapeutic-processes.repository'

import { CreateUserDynamooseAdapter } from './infrastructure/adapters/create-user-dynamoose.adapter'
import { FindAllUsersDynamooseAdapter } from './infrastructure/adapters/find-all-users-dynamoose.adapter'
import { FindUserByEmailDynamooseAdapter } from './infrastructure/adapters/find-user-by-email-dynamoose.adapter'
import { FindUserByIdDynamooseAdapter } from './infrastructure/adapters/find-user-by-id-dynamoose.adapter'
import { UpdateUserDynamooseAdapter } from './infrastructure/adapters/update-user-dynamoose.adapter'
import { UpdateUserStatusDynamooseAdapter } from './infrastructure/adapters/update-user-status-dynamoose.adapter'
import { DeleteUserDynamooseAdapter } from './infrastructure/adapters/delete-user-dynamoose.adapter'
import { UserTherapeuticProcessesDynamooseAdapter } from './infrastructure/adapters/user-therapeutic-processes-dynamoose.adapter'

@Module({
  imports: [AuthModule],

  controllers: [UpdateUserStatusController, DeleteUserController, CreateUserController, GetUsersController, GetUserByIdController, UpdateUserController],

  providers: [
    UpdateUserStatusDynamooseAdapter,
    { provide: 'IUpdateUserStatusRepository', useExisting: UpdateUserStatusDynamooseAdapter },
    {
      provide: UpdateUserStatusUseCase,
      useFactory: (users: IUserRepository, updater: IUpdateUserStatusRepository) => new UpdateUserStatusUseCase(users, updater),
      inject: ['IUserRepository', 'IUpdateUserStatusRepository'],
    },
    DeleteUserDynamooseAdapter,
    UserTherapeuticProcessesDynamooseAdapter,
    { provide: 'IDeleteUserRepository', useExisting: DeleteUserDynamooseAdapter },
    { provide: 'IUserTherapeuticProcessesRepository', useExisting: UserTherapeuticProcessesDynamooseAdapter },
    {
      provide: DeleteUserUseCase,
      useFactory: (users: IUserRepository, relations: IUserTherapeuticProcessesRepository, deleter: IDeleteUserRepository) => new DeleteUserUseCase(users, relations, deleter),
      inject: ['IUserRepository', 'IUserTherapeuticProcessesRepository', 'IDeleteUserRepository'],
    },
    UpdateUserDomainService,
    ValidateUpdateUserAccessDomainService,
    UpdateUserDynamooseAdapter,
    { provide: 'IUpdateUserRepository', useExisting: UpdateUserDynamooseAdapter },
    {
      provide: UpdateUserUseCase,
      useFactory: (access: ValidateUpdateUserAccessDomainService, domain: UpdateUserDomainService, users: IUserRepository, updater: IUpdateUserRepository) =>
        new UpdateUserUseCase(access, domain, users, updater),
      inject: [ValidateUpdateUserAccessDomainService, UpdateUserDomainService, 'IUserRepository', 'IUpdateUserRepository'],
    },
    ValidateGetUserByIdDomainService,
    {
      provide: GetUserByIdUseCase,
      useFactory: (domain: ValidateGetUserByIdDomainService, repository: IUserRepository) => new GetUserByIdUseCase(domain, repository),
      inject: [ValidateGetUserByIdDomainService, 'IUserRepository'],
    },
    FindAllUsersDynamooseAdapter,
    { provide: 'IFindAllUsersRepository', useExisting: FindAllUsersDynamooseAdapter },
    {
      provide: GetUsersUseCase,
      useFactory: (repository: IFindAllUsersRepository) => new GetUsersUseCase(repository),
      inject: ['IFindAllUsersRepository'],
    },
    ValidateCreateUserDomainService,
    {
      provide: CreateUserDomainService,
      useFactory: (validateCreate: ValidateCreateUserDomainService) => new CreateUserDomainService(validateCreate),
      inject: [ValidateCreateUserDomainService],
    },

    CreateUserDynamooseAdapter,
    FindUserByEmailDynamooseAdapter,
    FindUserByIdDynamooseAdapter,

    {
      provide: 'IUserRepository',
      useFactory: (createAdapter: CreateUserDynamooseAdapter, findByEmailAdapter: FindUserByEmailDynamooseAdapter, findByIdAdapter: FindUserByIdDynamooseAdapter): IUserRepository => ({
        create: (entity) => createAdapter.create(entity),
        findByEmail: (email) => findByEmailAdapter.findByEmail(email),
        findById: (id) => findByIdAdapter.findById(id),
      }),
      inject: [CreateUserDynamooseAdapter, FindUserByEmailDynamooseAdapter, FindUserByIdDynamooseAdapter],
    },

    JwtAuthProvider,
    CreateUserUseCase,
  ],

  exports: [CreateUserUseCase, 'IUserRepository'],
})
export class UsersModule {}
