import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { JwtAuthProvider } from '../auth/infrastructure/providers/jwt-auth.provider'

import { CreateUserController } from './presentation/http/controllers/create-user.controller'
import { GetUsersController } from './presentation/http/controllers/get-users.controller'
import { CreateUserUseCase } from './application/use-cases/create-user.use-case'
import { GetUsersUseCase } from './application/use-cases/get-users.use-case'

import { CreateUserDomainService } from './domain/services/create-user.domain-service'
import { ValidateCreateUserDomainService } from './domain/services/validate-create-user.domain-service'
import { ValidateGetUsersDomainService } from './domain/services/validate-get-users.domain-service'
import type { IUserRepository } from './domain/repositories/user.repository'
import type { IFindAllUsersRepository } from './domain/repositories/find-all-users.repository'

import { CreateUserDynamooseAdapter } from './infrastructure/adapters/create-user-dynamoose.adapter'
import { FindAllUsersDynamooseAdapter } from './infrastructure/adapters/find-all-users-dynamoose.adapter'
import { FindUserByEmailDynamooseAdapter } from './infrastructure/adapters/find-user-by-email-dynamoose.adapter'
import { FindUserByIdDynamooseAdapter } from './infrastructure/adapters/find-user-by-id-dynamoose.adapter'

@Module({
  imports: [AuthModule],

  controllers: [CreateUserController, GetUsersController],

  providers: [
    ValidateGetUsersDomainService,
    FindAllUsersDynamooseAdapter,
    { provide: 'IFindAllUsersRepository', useExisting: FindAllUsersDynamooseAdapter },
    {
      provide: GetUsersUseCase,
      useFactory: (domain: ValidateGetUsersDomainService, repository: IFindAllUsersRepository) => new GetUsersUseCase(domain, repository),
      inject: [ValidateGetUsersDomainService, 'IFindAllUsersRepository'],
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
