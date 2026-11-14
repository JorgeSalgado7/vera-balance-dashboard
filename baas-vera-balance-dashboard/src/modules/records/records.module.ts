import { Module } from '@nestjs/common'
import { TherapeuticProcessesModule } from '../therapeutic-processes/therapeutic-processes.module'
import type { IRecordRepository } from './domain/repositories/record.repository'
import { CreateRecordUseCase } from './application/use-cases/create-record.use-case'
import { CreateRecordController } from './presentation/http/controllers/create-record.controller'
import { GetTherapeuticProcessRecordsUseCase } from './application/use-cases/get-therapeutic-process-records.use-case'
import { GetTherapeuticProcessRecordsController } from './presentation/http/controllers/get-therapeutic-process-records.controller'
import { GetRecordByIdUseCase } from './application/use-cases/get-record-by-id.use-case'
import { GetRecordByIdController } from './presentation/http/controllers/get-record-by-id.controller'
import { UpdateRecordUseCase } from './application/use-cases/update-record.use-case'
import { UpdateRecordController } from './presentation/http/controllers/update-record.controller'
import { CreateRecordDynamooseAdapter } from './infrastructure/persistance/adapters/create-record-dynamoose.adapter'
import { FindRecordByIdDynamooseAdapter } from './infrastructure/persistance/adapters/find-record-by-id-dynamoose.adapter'
import { FindRecordsByProcessDynamooseAdapter } from './infrastructure/persistance/adapters/find-records-by-process-dynamoose.adapter'
import { UpdateRecordDynamooseAdapter } from './infrastructure/persistance/adapters/update-record-dynamoose.adapter'
import { ValidateRecordDomainService } from './domain/services/validate-record.domain-service'
import { CreateRecordDomainService } from './domain/services/create-record.domain-service'
import { UpdateRecordDomainService } from './domain/services/update-record.domain-service'

@Module({
  imports: [TherapeuticProcessesModule],
  exports: [GetRecordByIdUseCase],
  controllers: [CreateRecordController, GetTherapeuticProcessRecordsController, GetRecordByIdController, UpdateRecordController],
  providers: [
    CreateRecordDynamooseAdapter, FindRecordByIdDynamooseAdapter, FindRecordsByProcessDynamooseAdapter, UpdateRecordDynamooseAdapter,
    ValidateRecordDomainService,
    { provide: CreateRecordDomainService, useFactory: (validator: ValidateRecordDomainService) => new CreateRecordDomainService(validator), inject: [ValidateRecordDomainService] },
    { provide: UpdateRecordDomainService, useFactory: (validator: ValidateRecordDomainService) => new UpdateRecordDomainService(validator), inject: [ValidateRecordDomainService] },
    {
      provide: 'IRecordRepository',
      useFactory: (creator: CreateRecordDynamooseAdapter, reader: FindRecordByIdDynamooseAdapter,
        lister: FindRecordsByProcessDynamooseAdapter, updater: UpdateRecordDynamooseAdapter): IRecordRepository => ({
        create: entity => creator.create(entity),
        findById: id => reader.findById(id),
        findByProcess: id => lister.findByProcess(id),
        update: (id, changes, updatedAt) => updater.update(id, changes, updatedAt),
      }),
      inject: [CreateRecordDynamooseAdapter, FindRecordByIdDynamooseAdapter, FindRecordsByProcessDynamooseAdapter, UpdateRecordDynamooseAdapter],
    },
    CreateRecordUseCase, GetTherapeuticProcessRecordsUseCase, GetRecordByIdUseCase, UpdateRecordUseCase,
  ],
})
export class RecordsModule {}
