import { Injectable } from '@nestjs/common'
import { RecordModel } from '../models/record.model'
import { RecordMapper } from '../../mappers/record.mapper'
import type { RecordEntity } from '../../../domain/entities/record.entity'
import type { IRecordRepository } from '../../../domain/repositories/record.repository'
import { Condition } from 'dynamoose'
import type { UpdateRecordDto } from '../../../application/dtos/update-record.dto'
import { RecordNotFoundError } from '../../../domain/errors/record.error'

@Injectable()
export class UpdateRecordDynamooseAdapter implements Pick<IRecordRepository, 'update'> {
  async update(id: string, changes: UpdateRecordDto, updatedAt: string): Promise<RecordEntity> {
    const set: Record<string, unknown> = { updated_at: updatedAt }
    for (const field of ['session_date', 'attendance', 'resume', 'tools'] as const) {
      if (changes[field] !== undefined) set[field] = changes[field]
    }
    try {
      const item = await RecordModel.update({ pk: id, sk: 'RECORD' }, { $SET: set }, {
        condition: new Condition().where('pk').exists(), returnValues: 'ALL_NEW',
      })
      return RecordMapper.toEntity(item)
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') throw new RecordNotFoundError()
      throw error
    }
  }
}
