import { Module } from '@nestjs/common';
import { ClinicsModule } from '../clinics/clinics.module';
import { UsersClinicReaderModule } from './users-clinic-reader.module';

import { CreateUserController } from './presentation/controllers/create-user.controller';
import { GetUsersController } from './presentation/controllers/get-users.controller';
import { GetUserByIdController } from './presentation/controllers/get-user-by-id.controller';
import { UpdateUserController } from './presentation/controllers/update-user.controller';
import { DeleteUserController } from './presentation/controllers/delete-user.controller';
import { UpdateUserStatusController } from './presentation/controllers/update-user-status.controller';

import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { UpdateUserStatusUseCase } from './application/use-cases/update-user-status.use-case';

import { CreateUserDomainService } from './domain/services/create-user.domain-service';
import { ValidateUserDataDomainService } from './domain/services/validate-user-data.domain-service';
import { ValidateUserRoleDomainService } from './domain/services/validate-user-role.domain-service';
import { UpdateUserDomainService } from './domain/services/update-user.domain-service';
import { ValidateUserStatusDomainService } from './domain/services/validate-user-status.domain-service';
import { UpdateUserStatusDomainService } from './domain/services/update-user-status.domain-service';

import { CreateUserDynamooseAdapter } from './infrastructure/persistence/adapters/create-user-dynamoose.adapter';
import { FindUsersDynamooseAdapter } from './infrastructure/persistence/adapters/find-users-dynamoose.adapter';
import { FindUserByIdDynamooseAdapter } from './infrastructure/persistence/adapters/find-user-by-id-dynamoose.adapter';
import { FindUserByEmailDynamooseAdapter } from './infrastructure/persistence/adapters/find-user-by-email-dynamoose.adapter';
import { UpdateUserDynamooseAdapter } from './infrastructure/persistence/adapters/update-user-dynamoose.adapter';
import { DeleteUserDynamooseAdapter } from './infrastructure/persistence/adapters/delete-user-dynamoose.adapter';
import { UpdateUserStatusDynamooseAdapter } from './infrastructure/persistence/adapters/update-user-status-dynamoose.adapter';
import { ClinicReaderAdapter } from './infrastructure/providers/clinic-reader.adapter';
import { ScryptPasswordHasherAdapter } from './infrastructure/providers/scrypt-password-hasher.adapter';

@Module({
  imports: [ClinicsModule, UsersClinicReaderModule],
  controllers: [
    CreateUserController,
    GetUsersController,
    GetUserByIdController,
    UpdateUserController,
    DeleteUserController,
    UpdateUserStatusController
  ],
  providers: [
    CreateUserUseCase,
    GetUsersUseCase,
    GetUserByIdUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UpdateUserStatusUseCase,

    CreateUserDomainService,
    ValidateUserDataDomainService,
    ValidateUserRoleDomainService,
    UpdateUserDomainService,
    ValidateUserStatusDomainService,
    UpdateUserStatusDomainService,

    {
      provide: 'ICreateUserRepository',
      useClass: CreateUserDynamooseAdapter
    },
    {
      provide: 'IFindUsersRepository',
      useClass: FindUsersDynamooseAdapter
    },
    {
      provide: 'IFindUserByIdRepository',
      useClass: FindUserByIdDynamooseAdapter
    },
    {
      provide: 'IFindUserByEmailRepository',
      useClass: FindUserByEmailDynamooseAdapter
    },
    {
      provide: 'IUpdateUserRepository',
      useClass: UpdateUserDynamooseAdapter
    },
    {
      provide: 'IDeleteUserRepository',
      useClass: DeleteUserDynamooseAdapter
    },
    {
      provide: 'IUpdateUserStatusRepository',
      useClass: UpdateUserStatusDynamooseAdapter
    },
    {
      provide: 'PasswordHasherPort',
      useClass: ScryptPasswordHasherAdapter
    },
    {
      provide: 'ClinicReaderPort',
      useClass: ClinicReaderAdapter
    }
  ],
  exports: [UsersClinicReaderModule]
})
export class UsersModule {}
