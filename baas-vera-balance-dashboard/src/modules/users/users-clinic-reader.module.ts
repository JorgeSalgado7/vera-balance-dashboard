import { Module } from '@nestjs/common';
import { GetUserClinicIdUseCase } from './application/use-cases/get-user-clinic-id.use-case';
import { FindUserClinicIdDynamooseAdapter } from './infrastructure/persistence/adapters/find-user-clinic-id-dynamoose.adapter';

// This read capability has no dependency on Clinics, which Users consumes for writes.
@Module({
  providers: [
    GetUserClinicIdUseCase,
    {
      provide: 'IFindUserClinicIdRepository',
      useClass: FindUserClinicIdDynamooseAdapter
    }
  ],
  exports: [GetUserClinicIdUseCase]
})
export class UsersClinicReaderModule {}
