import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { JwtAuthProvider } from '../auth/infrastructure/providers/jwt-auth.provider'

import { CreateUserController } from './presentation/http/controllers/create-user.controller'
import { CreateUserUseCase } from './application/use-cases/create-user.use-case'

import { CreateUserDomainService } from './domain/services/create-user.domain-service'
import { ValidateCreateUserDomainService } from './domain/services/validate-create-user.domain-service'
import type { IUserRepository } from './domain/repositories/user.repository'

import { CreateUserDynamooseAdapter } from './infrastructure/adapters/create-user-dynamoose.adapter'
import { FindUserByEmailDynamooseAdapter } from './infrastructure/adapters/find-user-by-email-dynamoose.adapter'
import { FindUserByIdDynamooseAdapter } from './infrastructure/adapters/find-user-by-id-dynamoose.adapter'

@Module({
  imports: [AuthModule],

  controllers: [CreateUserController],

  providers: [
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
