import { Injectable } from '@nestjs/common'
import { HomeworkModel } from '../models/homework.model'
import { HomeworkMapper } from '../../mappers/homework.mapper'
import type { HomeworkEntity } from '../../../domain/entities/homework.entity'
import type { IHomeworkRepository } from '../../../domain/repositories/homework.repository'

@Injectable()
export class FindHomeworksByRecordDynamooseAdapter implements Pick<IHomeworkRepository, 'findByRecord'> {
  async findByRecord(recordId: string): Promise<HomeworkEntity[]> {
    const homeworks: HomeworkEntity[] = []
    let lastKey: Record<string, unknown> | undefined
    do {
      const query = HomeworkModel.query('gsi2pk').eq(`RECORD#${recordId}`).where('gsi2sk').beginsWith('HOME_WORK#').using('GSI2')
      if (lastKey) query.startAt(lastKey)
      const items = await query.exec()
      homeworks.push(...items.map(item => HomeworkMapper.toEntity(item)))
      lastKey = items.lastKey
    } while (lastKey)
    return homeworks
  }
}
