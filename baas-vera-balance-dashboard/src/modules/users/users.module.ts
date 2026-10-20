import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CsrfGuard } from '../../shared/http-security/csrf.guard';
import { ScryptPasswordHasherAdapter } from '../../shared/security/scrypt-password-hasher.adapter';
import { CreateUserController } from './presentation/controllers/create-user.controller';
import { GetUsersController } from './presentation/controllers/get-users.controller';
import { GetUserByIdController } from './presentation/controllers/get-user-by-id.controller';
import { UpdateUserController } from './presentation/controllers/update-user.controller';
import { DeleteUserController } from './presentation/controllers/delete-user.controller';
import { ChangeUserStatusController } from './presentation/controllers/change-user-status.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { ChangeUserStatusUseCase } from './application/use-cases/change-user-status.use-case';
import { CreateUserDomainService } from './domain/services/create-user.domain-service';
import { UpdateUserDomainService } from './domain/services/update-user.domain-service';
import { ChangeUserStatusDomainService } from './domain/services/change-user-status.domain-service';
import { AuthorizeUserAccessDomainService } from './domain/services/authorize-user-access.domain-service';
import { ProtectActiveAdministratorDomainService } from './domain/services/protect-active-administrator.domain-service';
import { ValidateUserNameDomainService } from './domain/services/validate-user-name.domain-service';
import { ValidateUserEmailDomainService } from './domain/services/validate-user-email.domain-service';
import { ValidateUserProfessionalLicenseDomainService } from './domain/services/validate-user-professional-license.domain-service';
import { ValidateUserRoleDomainService } from './domain/services/validate-user-role.domain-service';
import { ValidateUserPasswordDomainService } from './domain/services/validate-user-password.domain-service';
import { CreateUserDynamooseAdapter } from './infrastructure/persistence/adapters/create-user-dynamoose.adapter';
import { FindUsersDynamooseAdapter } from './infrastructure/persistence/adapters/find-users-dynamoose.adapter';
import { UpdateUserDynamooseAdapter } from './infrastructure/persistence/adapters/update-user-dynamoose.adapter';
import { DeleteUserDynamooseAdapter } from './infrastructure/persistence/adapters/delete-user-dynamoose.adapter';
import { ChangeUserStatusDynamooseAdapter } from './infrastructure/persistence/adapters/change-user-status-dynamoose.adapter';
import { DynamooseModule } from '../../infrastructure/dynamoose/dynamoose.module';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { FindUserByEmailUseCase } from './application/use-cases/find-user-by-email.use-case';
import { GetUserClinicIdUseCase } from './application/use-cases/get-user-clinic-id.use-case';
import { UpdateUserPasswordUseCase } from './application/use-cases/update-user-password.use-case';
import { FindUserByIdDynamooseAdapter } from './infrastructure/persistence/adapters/find-user-by-id-dynamoose.adapter';
import { FindUserByEmailDynamooseAdapter } from './infrastructure/persistence/adapters/find-user-by-email-dynamoose.adapter';
import { FindUserClinicIdDynamooseAdapter } from './infrastructure/persistence/adapters/find-user-clinic-id-dynamoose.adapter';
import { UpdateUserPasswordDynamooseAdapter } from './infrastructure/persistence/adapters/update-user-password-dynamoose.adapter';

@Module({
  imports: [DynamooseModule, ConfigModule],
  controllers: [
    CreateUserController, GetUsersController, GetUserByIdController,
    UpdateUserController, DeleteUserController, ChangeUserStatusController
  ],
  providers: [
    CsrfGuard,
    CreateUserUseCase, GetUsersUseCase, GetUserByIdUseCase,
    UpdateUserUseCase, DeleteUserUseCase, ChangeUserStatusUseCase,
    CreateUserDomainService, UpdateUserDomainService, ChangeUserStatusDomainService,
    AuthorizeUserAccessDomainService, ProtectActiveAdministratorDomainService,
    ValidateUserNameDomainService, ValidateUserEmailDomainService,
    ValidateUserProfessionalLicenseDomainService, ValidateUserRoleDomainService,
    ValidateUserPasswordDomainService,
    { provide: 'UserPasswordHasherPort', useClass: ScryptPasswordHasherAdapter },
    { provide: 'ICreateUserRepository', useClass: CreateUserDynamooseAdapter },
    { provide: 'IFindUsersRepository', useClass: FindUsersDynamooseAdapter },
    { provide: 'IUpdateUserRepository', useClass: UpdateUserDynamooseAdapter },
    { provide: 'IDeleteUserRepository', useClass: DeleteUserDynamooseAdapter },
    { provide: 'IChangeUserStatusRepository', useClass: ChangeUserStatusDynamooseAdapter },
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    GetUserClinicIdUseCase,
    UpdateUserPasswordUseCase,
    { provide: 'IFindUserByIdRepository', useClass: FindUserByIdDynamooseAdapter },
    { provide: 'IFindUserByEmailRepository', useClass: FindUserByEmailDynamooseAdapter },
    { provide: 'IFindUserClinicIdRepository', useClass: FindUserClinicIdDynamooseAdapter },
    { provide: 'IUpdateUserPasswordRepository', useClass: UpdateUserPasswordDynamooseAdapter }
  ],
  exports: [FindUserByIdUseCase, FindUserByEmailUseCase, GetUserClinicIdUseCase, UpdateUserPasswordUseCase]
})
export class UsersModule {}
