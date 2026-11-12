import { UpdateTherapyTypeDomainService } from './domain/services/update-therapy-type.domain-service'
import type { ITherapyTypeRepository } from './domain/repositories/therapy-type.repository'
import { Module } from '@nestjs/common'
import { CreateTherapyTypeDomainService } from './domain/services/create-therapy-type.domain-service'
import { CreateTherapyTypeUseCase } from './application/use-cases/create-therapy-type.use-case'
import { CreateTherapyTypeController } from './presentation/http/controllers/create-therapy-type.controller'
import { GetTherapyTypesUseCase } from './application/use-cases/get-therapy-types.use-case'
import { GetTherapyTypesController } from './presentation/http/controllers/get-therapy-types.controller'
import { GetTherapyTypeByIdUseCase } from './application/use-cases/get-therapy-type-by-id.use-case'
import { GetTherapyTypeByIdController } from './presentation/http/controllers/get-therapy-type-by-id.controller'
import { UpdateTherapyTypeUseCase } from './application/use-cases/update-therapy-type.use-case'
import { UpdateTherapyTypeController } from './presentation/http/controllers/update-therapy-type.controller'
import { DeleteTherapyTypeUseCase } from './application/use-cases/delete-therapy-type.use-case'
import { DeleteTherapyTypeController } from './presentation/http/controllers/delete-therapy-type.controller'
import { CreateTherapyTypeDynamooseAdapter } from './infrastructure/persistance/adapters/create-therapy-type-dynamoose.adapter'
import { FindTherapyTypeByIdDynamooseAdapter } from './infrastructure/persistance/adapters/find-therapy-type-by-id-dynamoose.adapter'
import { FindAllTherapyTypesDynamooseAdapter } from './infrastructure/persistance/adapters/find-all-therapy-types-dynamoose.adapter'
import { UpdateTherapyTypeDynamooseAdapter } from './infrastructure/persistance/adapters/update-therapy-type-dynamoose.adapter'
import { DeleteTherapyTypeDynamooseAdapter } from './infrastructure/persistance/adapters/delete-therapy-type-dynamoose.adapter'

@Module({
  controllers: [CreateTherapyTypeController, GetTherapyTypesController, GetTherapyTypeByIdController, UpdateTherapyTypeController, DeleteTherapyTypeController],
  providers: [
    CreateTherapyTypeDynamooseAdapter, FindTherapyTypeByIdDynamooseAdapter, FindAllTherapyTypesDynamooseAdapter, UpdateTherapyTypeDynamooseAdapter, DeleteTherapyTypeDynamooseAdapter,
    CreateTherapyTypeDomainService,
    UpdateTherapyTypeDomainService,
    {
      provide: 'ITherapyTypeRepository',
      useFactory: (
        creator: CreateTherapyTypeDynamooseAdapter,
        finder: FindTherapyTypeByIdDynamooseAdapter,
        lister: FindAllTherapyTypesDynamooseAdapter,
        updater: UpdateTherapyTypeDynamooseAdapter,
        deleter: DeleteTherapyTypeDynamooseAdapter,
      ): ITherapyTypeRepository => ({
        create: entity => creator.create(entity),
        findById: id => finder.findById(id),
        findAll: () => lister.findAll(),
        update: (entity, changes, updatedAt) => updater.update(entity, changes, updatedAt),
        delete: id => deleter.delete(id),
      }),
      inject: [CreateTherapyTypeDynamooseAdapter, FindTherapyTypeByIdDynamooseAdapter,
        FindAllTherapyTypesDynamooseAdapter, UpdateTherapyTypeDynamooseAdapter, DeleteTherapyTypeDynamooseAdapter],
    },
    CreateTherapyTypeUseCase,
    GetTherapyTypesUseCase,
    GetTherapyTypeByIdUseCase,
    UpdateTherapyTypeUseCase,
    DeleteTherapyTypeUseCase,
  ],
  exports: [GetTherapyTypeByIdUseCase],
})
export class TherapyTypesModule {}
