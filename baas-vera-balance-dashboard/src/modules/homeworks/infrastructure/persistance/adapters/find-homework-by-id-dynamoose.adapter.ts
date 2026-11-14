import { Injectable } from '@nestjs/common'
import { HomeworkModel } from '../models/homework.model'
import { HomeworkMapper } from '../../mappers/homework.mapper'
import type { HomeworkEntity } from '../../../domain/entities/homework.entity'
import type { IHomeworkRepository } from '../../../domain/repositories/homework.repository'

@Injectable()
export class FindHomeworkByIdDynamooseAdapter implements Pick<IHomeworkRepository, 'findById'> {
  async findById(id: string): Promise<HomeworkEntity | null> {
    const item = await HomeworkModel.get({ pk: id, sk: 'HOME_WORK' }, { consistent: true })
    return item ? HomeworkMapper.toEntity(item) : null
  }
}
