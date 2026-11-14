import { Injectable } from '@nestjs/common'
import { HomeworkModel } from '../models/homework.model'
import { HomeworkMapper } from '../../mappers/homework.mapper'
import type { HomeworkEntity } from '../../../domain/entities/homework.entity'
import type { IHomeworkRepository } from '../../../domain/repositories/homework.repository'

@Injectable()
export class CreateHomeworkDynamooseAdapter implements Pick<IHomeworkRepository, 'create'> {
  async create(entity: HomeworkEntity): Promise<HomeworkEntity> {
    await HomeworkModel.create(HomeworkMapper.toPersistence(entity), { overwrite: false })
    return entity
  }
}
