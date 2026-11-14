import { FindPatientsByIdsUseCase } from './application/use-cases/find-patients-by-ids.use-case'
import { FindPatientsByIdsDynamooseAdapter } from './infrastructure/persistance/adapters/find-patients-by-ids-dynamoose.adapter'
import { Module } from '@nestjs/common'
import { ClinicsModule } from '../clinics/clinics.module'
import type { IPatientRepository } from './domain/repositories/patient.repository'
import { CreatePatientUseCase } from './application/use-cases/create-patient.use-case'
import { CreatePatientController } from './presentation/http/controllers/create-patient.controller'
import { GetClinicPatientsUseCase } from './application/use-cases/get-clinic-patients.use-case'
import { GetClinicPatientsController } from './presentation/http/controllers/get-clinic-patients.controller'
import { GetPatientByIdUseCase } from './application/use-cases/get-patient-by-id.use-case'
import { GetPatientByIdController } from './presentation/http/controllers/get-patient-by-id.controller'
import { UpdatePatientUseCase } from './application/use-cases/update-patient.use-case'
import { UpdatePatientController } from './presentation/http/controllers/update-patient.controller'
import { ValidatePatientDomainService } from './domain/services/validate-patient.domain-service'
import { CreatePatientDomainService } from './domain/services/create-patient.domain-service'
import { UpdatePatientDomainService } from './domain/services/update-patient.domain-service'
import { CreatePatientDynamooseAdapter } from './infrastructure/persistance/adapters/create-patient-dynamoose.adapter'
import { FindPatientByIdDynamooseAdapter } from './infrastructure/persistance/adapters/find-patient-by-id-dynamoose.adapter'
import { FindPatientsByClinicDynamooseAdapter } from './infrastructure/persistance/adapters/find-patients-by-clinic-dynamoose.adapter'
import { UpdatePatientDynamooseAdapter } from './infrastructure/persistance/adapters/update-patient-dynamoose.adapter'

@Module({
  imports: [ClinicsModule],
  exports: [FindPatientsByIdsUseCase],
  controllers: [CreatePatientController, GetClinicPatientsController, GetPatientByIdController, UpdatePatientController],
  providers: [
    FindPatientsByIdsUseCase, FindPatientsByIdsDynamooseAdapter,
    CreatePatientDynamooseAdapter, FindPatientByIdDynamooseAdapter, FindPatientsByClinicDynamooseAdapter, UpdatePatientDynamooseAdapter,
    ValidatePatientDomainService,
    {
      provide: CreatePatientDomainService,
      useFactory: (validator: ValidatePatientDomainService) => new CreatePatientDomainService(validator),
      inject: [ValidatePatientDomainService],
    },
    {
      provide: UpdatePatientDomainService,
      useFactory: (validator: ValidatePatientDomainService) => new UpdatePatientDomainService(validator),
      inject: [ValidatePatientDomainService],
    },
    {
      provide: 'IPatientRepository',
      useFactory: (creator: CreatePatientDynamooseAdapter, reader: FindPatientByIdDynamooseAdapter,
        lister: FindPatientsByClinicDynamooseAdapter, updater: UpdatePatientDynamooseAdapter, batch: FindPatientsByIdsDynamooseAdapter): IPatientRepository => ({
        create: entity => creator.create(entity),
        findByIds: ids => batch.findByIds(ids),
        findById: id => reader.findById(id),
        findByClinic: clinicId => lister.findByClinic(clinicId),
        update: (entity, changes, updatedAt) => updater.update(entity, changes, updatedAt),
      }),
      inject: [CreatePatientDynamooseAdapter, FindPatientByIdDynamooseAdapter, FindPatientsByClinicDynamooseAdapter, UpdatePatientDynamooseAdapter, FindPatientsByIdsDynamooseAdapter],
    },
    CreatePatientUseCase, GetClinicPatientsUseCase, GetPatientByIdUseCase, UpdatePatientUseCase,
  ],
})
export class PatientsModule {}
