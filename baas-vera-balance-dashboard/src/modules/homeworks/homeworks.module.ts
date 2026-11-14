import { Module } from '@nestjs/common'
import { RecordsModule } from '../records/records.module'
import type { IHomeworkRepository } from './domain/repositories/homework.repository'
import { CreateHomeworkUseCase } from './application/use-cases/create-homework.use-case'
import { CreateHomeworkController } from './presentation/http/controllers/create-homework.controller'
import { GetRecordHomeworksUseCase } from './application/use-cases/get-record-homeworks.use-case'
import { GetRecordHomeworksController } from './presentation/http/controllers/get-record-homeworks.controller'
import { GetHomeworkByIdUseCase } from './application/use-cases/get-homework-by-id.use-case'
import { GetHomeworkByIdController } from './presentation/http/controllers/get-homework-by-id.controller'
import { UpdateHomeworkUseCase } from './application/use-cases/update-homework.use-case'
import { UpdateHomeworkController } from './presentation/http/controllers/update-homework.controller'
import { CreateHomeworkDynamooseAdapter } from './infrastructure/persistance/adapters/create-homework-dynamoose.adapter'
import { FindHomeworkByIdDynamooseAdapter } from './infrastructure/persistance/adapters/find-homework-by-id-dynamoose.adapter'
import { FindHomeworksByRecordDynamooseAdapter } from './infrastructure/persistance/adapters/find-homeworks-by-record-dynamoose.adapter'
import { UpdateHomeworkDynamooseAdapter } from './infrastructure/persistance/adapters/update-homework-dynamoose.adapter'
import { ValidateHomeworkDomainService } from './domain/services/validate-homework.domain-service'
import { CreateHomeworkDomainService } from './domain/services/create-homework.domain-service'
import { UpdateHomeworkDomainService } from './domain/services/update-homework.domain-service'

@Module({
  imports: [RecordsModule],
  controllers: [CreateHomeworkController, GetRecordHomeworksController, GetHomeworkByIdController, UpdateHomeworkController],
  providers: [
    CreateHomeworkDynamooseAdapter, FindHomeworkByIdDynamooseAdapter, FindHomeworksByRecordDynamooseAdapter, UpdateHomeworkDynamooseAdapter,
    ValidateHomeworkDomainService,
    { provide: CreateHomeworkDomainService, useFactory: (validator: ValidateHomeworkDomainService) => new CreateHomeworkDomainService(validator), inject: [ValidateHomeworkDomainService] },
    { provide: UpdateHomeworkDomainService, useFactory: (validator: ValidateHomeworkDomainService) => new UpdateHomeworkDomainService(validator), inject: [ValidateHomeworkDomainService] },
    {
      provide: 'IHomeworkRepository',
      useFactory: (creator: CreateHomeworkDynamooseAdapter, reader: FindHomeworkByIdDynamooseAdapter,
        lister: FindHomeworksByRecordDynamooseAdapter, updater: UpdateHomeworkDynamooseAdapter): IHomeworkRepository => ({
        create: entity => creator.create(entity),
        findById: id => reader.findById(id),
        findByRecord: id => lister.findByRecord(id),
        update: (id, changes, updatedAt) => updater.update(id, changes, updatedAt),
      }),
      inject: [CreateHomeworkDynamooseAdapter, FindHomeworkByIdDynamooseAdapter, FindHomeworksByRecordDynamooseAdapter, UpdateHomeworkDynamooseAdapter],
    },
    CreateHomeworkUseCase, GetRecordHomeworksUseCase, GetHomeworkByIdUseCase, UpdateHomeworkUseCase,
  ],
})
export class HomeworksModule {}
