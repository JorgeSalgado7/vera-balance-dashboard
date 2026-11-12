import { EmailsModule } from '../emails/emails.module'
import { SendPasswordUpdatedEmailUseCase } from '../emails/application/use-cases/send-password-updated-email.use-case'
import { ResetUserPasswordUseCase } from './application/use-cases/reset-user-password.use-case'
import type { IUserRepository } from './domain/repositories/user.repository'
import { ResetUserPasswordDynamooseAdapter } from './infrastructure/persistance/adapters/reset-user-password-dynamoose.adapter'
import { SetUserPasswordRecoveryUseCase } from './application/use-cases/set-user-password-recovery.use-case'
import { SetUserPasswordRecoveryDynamooseAdapter } from './infrastructure/persistance/adapters/set-user-password-recovery-dynamoose.adapter'
import { Module } from '@nestjs/common'

import { PasswordModule } from '../auth/password.module'
import { FindUserByEmailUseCase } from './application/use-cases/find-user-by-email.use-case'
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
  imports: [PasswordModule, EmailsModule],

  controllers: [ChangeUserPasswordController, UpdateUserStatusController, DeleteUserController, CreateUserController, GetUsersController, GetUserByIdController, UpdateUserController],

  providers: [
    ResetUserPasswordDynamooseAdapter,
    {
      provide: ResetUserPasswordUseCase,
      useFactory: (domain: ValidateChangeUserPasswordDomainService, hasher: IHashPasswordService,
        repository: IUserRepository) => new ResetUserPasswordUseCase(domain, hasher, repository),
      inject: [ValidateChangeUserPasswordDomainService, 'IHashPasswordService', 'IUserRepository'],
    },
    SetUserPasswordRecoveryDynamooseAdapter,
    {
      provide: SetUserPasswordRecoveryUseCase,
      useFactory: (repository: IUserRepository) => new SetUserPasswordRecoveryUseCase(repository),
      inject: ['IUserRepository'],
    },
    {
      provide: FindUserByEmailUseCase,
      useFactory: (repository: IUserRepository) => new FindUserByEmailUseCase(repository),
      inject: ['IUserRepository'],
    },
    ValidateChangeUserPasswordDomainService,
    ChangeUserPasswordDynamooseAdapter,
    {
      provide: ChangeUserPasswordUseCase,
      useFactory: (domain: ValidateChangeUserPasswordDomainService, users: IUserRepository, verifier: IVerifyPasswordService, hasher: IHashPasswordService, notification: SendPasswordUpdatedEmailUseCase) =>
        new ChangeUserPasswordUseCase(domain, users, verifier, hasher, notification),
      inject: [ValidateChangeUserPasswordDomainService, 'IUserRepository', 'IVerifyPasswordService', 'IHashPasswordService', SendPasswordUpdatedEmailUseCase],
    },
    UpdateUserStatusDynamooseAdapter,
    {
      provide: UpdateUserStatusUseCase,
      useFactory: (repository: IUserRepository) => new UpdateUserStatusUseCase(repository),
      inject: ['IUserRepository'],
    },
    DeleteUserDynamooseAdapter,
    UserTherapeuticProcessesDynamooseAdapter,
    {
      provide: DeleteUserUseCase,
      useFactory: (repository: IUserRepository) => new DeleteUserUseCase(repository),
      inject: ['IUserRepository'],
    },
    UpdateUserDomainService,
    UpdateUserDynamooseAdapter,
    {
      provide: UpdateUserUseCase,
      useFactory: (domain: UpdateUserDomainService, repository: IUserRepository) =>
        new UpdateUserUseCase(domain, repository),
      inject: [UpdateUserDomainService, 'IUserRepository'],
    },
    {
      provide: GetUserByIdUseCase,
      useFactory: (repository: IUserRepository) => new GetUserByIdUseCase(repository),
      inject: ['IUserRepository'],
    },
    FindAllUsersDynamooseAdapter,
    {
      provide: GetUsersUseCase,
      useFactory: (repository: IUserRepository) => new GetUsersUseCase(repository),
      inject: ['IUserRepository'],
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
      useFactory: (createAdapter: CreateUserDynamooseAdapter, findByEmailAdapter: FindUserByEmailDynamooseAdapter, findByIdAdapter: FindUserByIdDynamooseAdapter,
        findAllAdapter: FindAllUsersDynamooseAdapter, updateAdapter: UpdateUserDynamooseAdapter,
        statusAdapter: UpdateUserStatusDynamooseAdapter, passwordAdapter: ChangeUserPasswordDynamooseAdapter,
        deleteAdapter: DeleteUserDynamooseAdapter, processesAdapter: UserTherapeuticProcessesDynamooseAdapter,
        resetAdapter: ResetUserPasswordDynamooseAdapter, recoveryAdapter: SetUserPasswordRecoveryDynamooseAdapter,
      ): IUserRepository => ({
        create: (entity) => createAdapter.create(entity),
        findByEmail: (email) => findByEmailAdapter.findByEmail(email),
        findById: (id) => findByIdAdapter.findById(id),
        findAll: () => findAllAdapter.findAll(),
        update: (user, changes, updatedAt) => updateAdapter.update(user, changes, updatedAt),
        updateStatus: (user, status, updatedAt) => statusAdapter.updateStatus(user, status, updatedAt),
        changePassword: (user, passwordHash, updatedAt) => passwordAdapter.changePassword(user, passwordHash, updatedAt),
        delete: (user) => deleteAdapter.delete(user),
        hasTherapeuticProcesses: (userId) => processesAdapter.hasTherapeuticProcesses(userId),
        reset: (input, updatedAt) => resetAdapter.reset(input, updatedAt),
        set: (input, updatedAt) => recoveryAdapter.set(input, updatedAt),
      }),
      inject: [CreateUserDynamooseAdapter, FindUserByEmailDynamooseAdapter, FindUserByIdDynamooseAdapter,
        FindAllUsersDynamooseAdapter, UpdateUserDynamooseAdapter, UpdateUserStatusDynamooseAdapter,
        ChangeUserPasswordDynamooseAdapter, DeleteUserDynamooseAdapter, UserTherapeuticProcessesDynamooseAdapter,
        ResetUserPasswordDynamooseAdapter, SetUserPasswordRecoveryDynamooseAdapter],
    },

    CreateUserUseCase,
  ],

  exports: [CreateUserUseCase, FindUserByEmailUseCase, SetUserPasswordRecoveryUseCase, ResetUserPasswordUseCase],
})
export class UsersModule {}
