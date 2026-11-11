import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import type { IHashPasswordService } from '../auth/domain/services/hash-password.service'
import type { IVerifyPasswordService } from '../auth/domain/services/verify-password.service'

import { CreateUserController } from './presentation/http/controllers/create-user.controller'
import { GetUsersController } from './presentation/http/controllers/get-users.controller'
import { GetUserByIdController } from './presentation/http/controllers/get-user-by-id.controller'
import { UpdateUserController } from './presentation/http/controllers/update-user.controller'
import { UpdateUserStatusController } from './presentation/http/controllers/update-user-status.controller'
import { ChangeUserPasswordController } from './presentation/http/controllers/change-user-password.controller'
import { DeleteUserController } from './presentation/http/controllers/delete-user.controller'
import { CreateUserUseCase } from './application/use-cases/create-user.use-case'
import { GetUsersUseCase } from './application/use-cases/get-users.use-case'
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case'
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case'
import { UpdateUserStatusUseCase } from './application/use-cases/update-user-status.use-case'
import { ChangeUserPasswordUseCase } from './application/use-cases/change-user-password.use-case'
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case'

import { CreateUserDomainService } from './domain/services/create-user.domain-service'
import { ValidateCreateUserDomainService } from './domain/services/validate-create-user.domain-service'
import { UpdateUserDomainService } from './domain/services/update-user.domain-service'
import { ValidateChangeUserPasswordDomainService } from './domain/services/validate-change-user-password.domain-service'
import type { IUserRepository } from './domain/repositories/user.repository'
import type { IFindAllUsersRepository } from './domain/repositories/find-all-users.repository'
import type { IUpdateUserRepository } from './domain/repositories/update-user.repository'
import type { IUpdateUserStatusRepository } from './domain/repositories/update-user-status.repository'
import type { IChangeUserPasswordRepository } from './domain/repositories/change-user-password.repository'
import type { IDeleteUserRepository } from './domain/repositories/delete-user.repository'
import type { IUserTherapeuticProcessesRepository } from './domain/repositories/user-therapeutic-processes.repository'

import { CreateUserDynamooseAdapter } from './infrastructure/persistance/adapters/create-user-dynamoose.adapter'
import { FindAllUsersDynamooseAdapter } from './infrastructure/persistance/adapters/find-all-users-dynamoose.adapter'
import { FindUserByEmailDynamooseAdapter } from './infrastructure/persistance/adapters/find-user-by-email-dynamoose.adapter'
import { FindUserByIdDynamooseAdapter } from './infrastructure/persistance/adapters/find-user-by-id-dynamoose.adapter'
import { UpdateUserDynamooseAdapter } from './infrastructure/persistance/adapters/update-user-dynamoose.adapter'
import { UpdateUserStatusDynamooseAdapter } from './infrastructure/persistance/adapters/update-user-status-dynamoose.adapter'
import { ChangeUserPasswordDynamooseAdapter } from './infrastructure/persistance/adapters/change-user-password-dynamoose.adapter'
import { DeleteUserDynamooseAdapter } from './infrastructure/persistance/adapters/delete-user-dynamoose.adapter'
import { UserTherapeuticProcessesDynamooseAdapter } from './infrastructure/persistance/adapters/user-therapeutic-processes-dynamoose.adapter'

@Module({
  imports: [AuthModule],

  controllers: [ChangeUserPasswordController, UpdateUserStatusController, DeleteUserController, CreateUserController, GetUsersController, GetUserByIdController, UpdateUserController],

  providers: [
    ValidateChangeUserPasswordDomainService,
    ChangeUserPasswordDynamooseAdapter,
    { provide: 'IChangeUserPasswordRepository', useExisting: ChangeUserPasswordDynamooseAdapter },
    {
      provide: ChangeUserPasswordUseCase,
      useFactory: (domain: ValidateChangeUserPasswordDomainService, users: IUserRepository, verifier: IVerifyPasswordService, hasher: IHashPasswordService, updater: IChangeUserPasswordRepository) =>
        new ChangeUserPasswordUseCase(domain, users, verifier, hasher, updater),
      inject: [ValidateChangeUserPasswordDomainService, 'IUserRepository', 'IVerifyPasswordService', 'IHashPasswordService', 'IChangeUserPasswordRepository'],
    },
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
    UpdateUserDynamooseAdapter,
    { provide: 'IUpdateUserRepository', useExisting: UpdateUserDynamooseAdapter },
    {
      provide: UpdateUserUseCase,
      useFactory: (domain: UpdateUserDomainService, users: IUserRepository, updater: IUpdateUserRepository) =>
        new UpdateUserUseCase(domain, users, updater),
      inject: [UpdateUserDomainService, 'IUserRepository', 'IUpdateUserRepository'],
    },
    {
      provide: GetUserByIdUseCase,
      useFactory: (repository: IUserRepository) => new GetUserByIdUseCase(repository),
      inject: ['IUserRepository'],
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

    CreateUserUseCase,
  ],

  exports: [CreateUserUseCase, 'IUserRepository'],
})
export class UsersModule {}
