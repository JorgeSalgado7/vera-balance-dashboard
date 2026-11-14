import { Module } from '@nestjs/common'
import { ClinicsModule } from '../clinics/clinics.module'
import { PatientsModule } from '../patients/patients.module'
import { UsersModule } from '../users/users.module'
import { TherapyTypesModule } from '../therapy-types/therapy-types.module'
import type { ITherapeuticProcessRepository } from './domain/repositories/therapeutic-process.repository'
import { CreateTherapeuticProcessUseCase } from './application/use-cases/create-therapeutic-process.use-case'
import { CreateTherapeuticProcessController } from './presentation/http/controllers/create-therapeutic-process.controller'
import { GetClinicTherapeuticProcessesUseCase } from './application/use-cases/get-clinic-therapeutic-processes.use-case'
import { GetClinicTherapeuticProcessesController } from './presentation/http/controllers/get-clinic-therapeutic-processes.controller'
import { GetPatientTherapeuticProcessesUseCase } from './application/use-cases/get-patient-therapeutic-processes.use-case'
import { GetPatientTherapeuticProcessesController } from './presentation/http/controllers/get-patient-therapeutic-processes.controller'
import { GetTherapeuticProcessByIdUseCase } from './application/use-cases/get-therapeutic-process-by-id.use-case'
import { GetTherapeuticProcessByIdController } from './presentation/http/controllers/get-therapeutic-process-by-id.controller'
import { UpdateTherapeuticProcessUseCase } from './application/use-cases/update-therapeutic-process.use-case'
import { UpdateTherapeuticProcessController } from './presentation/http/controllers/update-therapeutic-process.controller'
import { DeleteTherapeuticProcessUseCase } from './application/use-cases/delete-therapeutic-process.use-case'
import { DeleteTherapeuticProcessController } from './presentation/http/controllers/delete-therapeutic-process.controller'
import { UpdateTherapeuticProcessStatusUseCase } from './application/use-cases/update-therapeutic-process-status.use-case'
import { UpdateTherapeuticProcessStatusController } from './presentation/http/controllers/update-therapeutic-process-status.controller'
import { ValidateTherapeuticProcessDomainService } from './domain/services/validate-therapeutic-process.domain-service'
import { CreateTherapeuticProcessDomainService } from './domain/services/create-therapeutic-process.domain-service'
import { UpdateTherapeuticProcessDomainService } from './domain/services/update-therapeutic-process.domain-service'
import { ValidateTherapyPatientsDomainService } from './domain/services/validate-therapy-patients.domain-service'
import { ResolveTherapeuticProcessRelationsUseCase } from './application/use-cases/resolve-therapeutic-process-relations.use-case'
import { ValidateTherapeuticProcessRelationsUseCase } from './application/use-cases/validate-therapeutic-process-relations.use-case'
import { CreateTherapeuticProcessDynamooseAdapter } from './infrastructure/persistance/adapters/create-therapeutic-process-dynamoose.adapter'
import { FindTherapeuticProcessByIdDynamooseAdapter } from './infrastructure/persistance/adapters/find-therapeutic-process-by-id-dynamoose.adapter'
import { FindTherapeuticProcessesByClinicDynamooseAdapter } from './infrastructure/persistance/adapters/find-therapeutic-processes-by-clinic-dynamoose.adapter'
import { FindTherapeuticProcessesByPatientDynamooseAdapter } from './infrastructure/persistance/adapters/find-therapeutic-processes-by-patient-dynamoose.adapter'
import { UpdateTherapeuticProcessDynamooseAdapter } from './infrastructure/persistance/adapters/update-therapeutic-process-dynamoose.adapter'
import { UpdateTherapeuticProcessStatusDynamooseAdapter } from './infrastructure/persistance/adapters/update-therapeutic-process-status-dynamoose.adapter'
import { DeleteTherapeuticProcessCascadeDynamooseAdapter } from './infrastructure/persistance/adapters/delete-therapeutic-process-cascade-dynamoose.adapter'

@Module({
  imports: [ClinicsModule, PatientsModule, UsersModule, TherapyTypesModule],
  controllers: [CreateTherapeuticProcessController, GetClinicTherapeuticProcessesController, GetPatientTherapeuticProcessesController, GetTherapeuticProcessByIdController, UpdateTherapeuticProcessController, DeleteTherapeuticProcessController, UpdateTherapeuticProcessStatusController],
  providers: [
    CreateTherapeuticProcessDynamooseAdapter, FindTherapeuticProcessByIdDynamooseAdapter, FindTherapeuticProcessesByClinicDynamooseAdapter, FindTherapeuticProcessesByPatientDynamooseAdapter, UpdateTherapeuticProcessDynamooseAdapter, UpdateTherapeuticProcessStatusDynamooseAdapter, DeleteTherapeuticProcessCascadeDynamooseAdapter,
    ValidateTherapeuticProcessDomainService,
    ValidateTherapyPatientsDomainService,
    {
      provide: CreateTherapeuticProcessDomainService,
      useFactory: (validator: ValidateTherapeuticProcessDomainService) => new CreateTherapeuticProcessDomainService(validator),
      inject: [ValidateTherapeuticProcessDomainService],
    },
    {
      provide: UpdateTherapeuticProcessDomainService,
      useFactory: (validator: ValidateTherapeuticProcessDomainService) => new UpdateTherapeuticProcessDomainService(validator),
      inject: [ValidateTherapeuticProcessDomainService],
    },
    {
      provide: 'ITherapeuticProcessRepository',
      useFactory: (creator: CreateTherapeuticProcessDynamooseAdapter, reader: FindTherapeuticProcessByIdDynamooseAdapter,
        byClinic: FindTherapeuticProcessesByClinicDynamooseAdapter, byPatient: FindTherapeuticProcessesByPatientDynamooseAdapter,
        updater: UpdateTherapeuticProcessDynamooseAdapter, status: UpdateTherapeuticProcessStatusDynamooseAdapter,
        deleter: DeleteTherapeuticProcessCascadeDynamooseAdapter): ITherapeuticProcessRepository => ({
        create: entity => creator.create(entity),
        findById: id => reader.findById(id),
        findByClinic: id => byClinic.findByClinic(id),
        findByPatient: id => byPatient.findByPatient(id),
        update: (entity, changes, updatedAt) => updater.update(entity, changes, updatedAt),
        updateStatus: (id, value, updatedAt) => status.updateStatus(id, value, updatedAt),
        deleteCascade: entity => deleter.deleteCascade(entity),
      }),
      inject: [CreateTherapeuticProcessDynamooseAdapter, FindTherapeuticProcessByIdDynamooseAdapter, FindTherapeuticProcessesByClinicDynamooseAdapter, FindTherapeuticProcessesByPatientDynamooseAdapter, UpdateTherapeuticProcessDynamooseAdapter, UpdateTherapeuticProcessStatusDynamooseAdapter, DeleteTherapeuticProcessCascadeDynamooseAdapter],
    },
    ResolveTherapeuticProcessRelationsUseCase, ValidateTherapeuticProcessRelationsUseCase,
    CreateTherapeuticProcessUseCase, GetClinicTherapeuticProcessesUseCase, GetPatientTherapeuticProcessesUseCase, GetTherapeuticProcessByIdUseCase, UpdateTherapeuticProcessUseCase, DeleteTherapeuticProcessUseCase, UpdateTherapeuticProcessStatusUseCase,
  ],
})
export class TherapeuticProcessesModule {}
