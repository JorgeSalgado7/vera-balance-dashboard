import { Injectable } from '@nestjs/common'
import { RecordModel } from '../models/record.model'
import { RecordMapper } from '../../mappers/record.mapper'
import type { RecordEntity } from '../../../domain/entities/record.entity'
import type { IRecordRepository } from '../../../domain/repositories/record.repository'

@Injectable()
export class FindRecordsByProcessDynamooseAdapter implements Pick<IRecordRepository, 'findByProcess'> {
  async findByProcess(processId: string): Promise<RecordEntity[]> {
    const records: RecordEntity[] = []
    let lastKey: Record<string, unknown> | undefined
    do {
      const query = RecordModel.query('gsi2pk').eq(`THERAPEUTIC_PROCESS#${processId}`).where('gsi2sk').beginsWith('RECORD#').using('GSI2')
      if (lastKey) query.startAt(lastKey)
      const items = await query.exec()
      records.push(...items.map(item => RecordMapper.toEntity(item)))
      lastKey = items.lastKey
    } while (lastKey)
    return records
  }
}
