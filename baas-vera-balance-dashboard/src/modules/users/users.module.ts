import { Module } from '@nestjs/common';
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
  imports: [DynamooseModule],
  providers: [
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
