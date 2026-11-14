import { Injectable } from '@nestjs/common'
import { RecordModel } from '../models/record.model'
import { RecordMapper } from '../../mappers/record.mapper'
import type { RecordEntity } from '../../../domain/entities/record.entity'
import type { IRecordRepository } from '../../../domain/repositories/record.repository'

@Injectable()
export class CreateRecordDynamooseAdapter implements Pick<IRecordRepository, 'create'> {
  async create(entity: RecordEntity): Promise<RecordEntity> {
    await RecordModel.create(RecordMapper.toPersistence(entity), { overwrite: false })
    return entity
  }
}
