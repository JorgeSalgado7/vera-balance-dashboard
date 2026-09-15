import { Module } from '@nestjs/common';

import { CreateClinicController } from './presentation/controllers/create-clinic.controller';
import { UpdateClinicController } from './presentation/controllers/update-clinic.controller';
import { GetClinicByIdController } from './presentation/controllers/get-clinic-by-id.controller';
// import { GetClinicByUserIdController } from './presentation/controllers/get-clinic-by-user-id.controller';
import { GetClinicsController } from './presentation/controllers/get-clinics.controller';
import { DeleteClinicController } from './presentation/controllers/delete-clinic.controller';

import { CreateClinicUseCase } from './application/use-cases/create-clinic.use-case';
import { UpdateClinicUseCase } from './application/use-cases/update-clinic.use-case';
import { GetClinicByIdUseCase } from './application/use-cases/get-clinic-by-id.use-case';
// import { GetClinicByUserIdUseCase } from './application/use-cases/get-clinic-by-user-id.use-case';
import { GetClinicsUseCase } from './application/use-cases/get-clinics.use-case';
import { DeleteClinicUseCase } from './application/use-cases/delete-clinic.use-case';

import { CreateClinicDomainService } from './domain/services/create-clinic.domain-service';
import { UpdateClinicDomainService } from './domain/services/update-clinic.domain-service';
import { ValidateClinicStatusDomainService } from './domain/services/validate-clinic-status.domain-service';
import { ValidateTherapyTypesDomainService } from './domain/services/validate-therapy-types.domain-service';

import { CreateClinicDynamooseAdapter } from './infrastructure/persistence/adapters/create-clinic-dynamoose.adapter';
import { UpdateClinicDynamooseAdapter } from './infrastructure/persistence/adapters/update-clinic-dynamoose.adapter';
import { FindClinicByIdDynamooseAdapter } from './infrastructure/persistence/adapters/find-clinic-by-id-dynamoose.adapter';
import { FindClinicsDynamooseAdapter } from './infrastructure/persistence/adapters/find-clinics-dynamoose.adapter';
import { DeleteClinicDynamooseAdapter } from './infrastructure/persistence/adapters/delete-clinic-dynamoose.adapter';

@Module({
  controllers: [
    CreateClinicController,
    UpdateClinicController,
    GetClinicByIdController,
    // GetClinicByUserIdController,
    GetClinicsController,
    DeleteClinicController
  ],

  providers: [
    CreateClinicDomainService,
    UpdateClinicDomainService,
    ValidateClinicStatusDomainService,
    ValidateTherapyTypesDomainService,

    CreateClinicUseCase,
    UpdateClinicUseCase,
    GetClinicByIdUseCase,
    // GetClinicByUserIdUseCase,
    GetClinicsUseCase,
    DeleteClinicUseCase,

    {
      provide: 'ICreateClinicRepository',
      useClass: CreateClinicDynamooseAdapter
    },
    {
      provide: 'IUpdateClinicRepository',
      useClass: UpdateClinicDynamooseAdapter
    },
    {
      provide: 'IFindClinicByIdRepository',
      useClass: FindClinicByIdDynamooseAdapter
    },
    {
      provide: 'IFindClinicsRepository',
      useClass: FindClinicsDynamooseAdapter
    },
    {
      provide: 'IDeleteClinicRepository',
      useClass: DeleteClinicDynamooseAdapter
    }
  ],

  exports: [
    CreateClinicUseCase,
    UpdateClinicUseCase,
    GetClinicByIdUseCase,
    GetClinicsUseCase,
    'IFindClinicByIdRepository'
  ]
})
export class ClinicsModule {}