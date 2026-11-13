import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { TherapyTypesModule } from '../therapy-types/therapy-types.module'
import type { IClinicRepository } from './domain/repositories/clinic.repository'
import { CreateClinicUseCase } from './application/use-cases/create-clinic.use-case'
import { CreateClinicController } from './presentation/http/controllers/create-clinic.controller'
import { GetClinicsUseCase } from './application/use-cases/get-clinics.use-case'
import { GetClinicsController } from './presentation/http/controllers/get-clinics.controller'
import { GetClinicByIdUseCase } from './application/use-cases/get-clinic-by-id.use-case'
import { GetClinicByIdController } from './presentation/http/controllers/get-clinic-by-id.controller'
import { UpdateClinicUseCase } from './application/use-cases/update-clinic.use-case'
import { UpdateClinicController } from './presentation/http/controllers/update-clinic.controller'
import { GetClinicUsersUseCase } from './application/use-cases/get-clinic-users.use-case'
import { GetClinicUsersController } from './presentation/http/controllers/get-clinic-users.controller'
import { ValidateCreateClinicDomainService } from './domain/services/validate-create-clinic.domain-service'
import { CreateClinicDomainService } from './domain/services/create-clinic.domain-service'
import { UpdateClinicDomainService } from './domain/services/update-clinic.domain-service'
import { ResolveClinicTherapyTypesUseCase } from './application/use-cases/resolve-clinic-therapy-types.use-case'
import { CreateClinicDynamooseAdapter } from './infrastructure/persistance/adapters/create-clinic-dynamoose.adapter'
import { FindClinicByIdDynamooseAdapter } from './infrastructure/persistance/adapters/find-clinic-by-id-dynamoose.adapter'
import { FindAllClinicsDynamooseAdapter } from './infrastructure/persistance/adapters/find-all-clinics-dynamoose.adapter'
import { UpdateClinicDynamooseAdapter } from './infrastructure/persistance/adapters/update-clinic-dynamoose.adapter'

@Module({
  imports: [UsersModule, TherapyTypesModule],
  controllers: [CreateClinicController, GetClinicsController, GetClinicByIdController, UpdateClinicController, GetClinicUsersController],
  providers: [
    CreateClinicDynamooseAdapter, FindClinicByIdDynamooseAdapter, FindAllClinicsDynamooseAdapter, UpdateClinicDynamooseAdapter,
    ValidateCreateClinicDomainService,
    {
      provide: CreateClinicDomainService,
      useFactory: (validator: ValidateCreateClinicDomainService) => new CreateClinicDomainService(validator),
      inject: [ValidateCreateClinicDomainService],
    },
    {
      provide: UpdateClinicDomainService,
      useFactory: (validator: ValidateCreateClinicDomainService) => new UpdateClinicDomainService(validator),
      inject: [ValidateCreateClinicDomainService],
    },
    {
      provide: 'IClinicRepository',
      useFactory: (creator: CreateClinicDynamooseAdapter, reader: FindClinicByIdDynamooseAdapter,
        lister: FindAllClinicsDynamooseAdapter, updater: UpdateClinicDynamooseAdapter): IClinicRepository => ({
        create: entity => creator.create(entity),
        findById: id => reader.findById(id),
        findAll: () => lister.findAll(),
        update: (entity, changes, updatedAt) => updater.update(entity, changes, updatedAt),
      }),
      inject: [CreateClinicDynamooseAdapter, FindClinicByIdDynamooseAdapter, FindAllClinicsDynamooseAdapter, UpdateClinicDynamooseAdapter],
    },
    ResolveClinicTherapyTypesUseCase,
    CreateClinicUseCase, GetClinicsUseCase, GetClinicByIdUseCase, UpdateClinicUseCase, GetClinicUsersUseCase,
  ],
})
export class ClinicsModule {}
