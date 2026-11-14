import { Injectable } from '@nestjs/common'
import { RecordModel } from '../models/record.model'
import { RecordMapper } from '../../mappers/record.mapper'
import type { RecordEntity } from '../../../domain/entities/record.entity'
import type { IRecordRepository } from '../../../domain/repositories/record.repository'

@Injectable()
export class FindRecordByIdDynamooseAdapter implements Pick<IRecordRepository, 'findById'> {
  async findById(id: string): Promise<RecordEntity | null> {
    const item = await RecordModel.get({ pk: id, sk: 'RECORD' }, { consistent: true })
    return item ? RecordMapper.toEntity(item) : null
  }
}
