import { Injectable } from '@nestjs/common'
import { HomeworkModel } from '../models/homework.model'
import { HomeworkMapper } from '../../mappers/homework.mapper'
import type { HomeworkEntity } from '../../../domain/entities/homework.entity'
import type { IHomeworkRepository } from '../../../domain/repositories/homework.repository'
import { Condition } from 'dynamoose'
import type { UpdateHomeworkDto } from '../../../application/dtos/update-homework.dto'
import { HomeworkNotFoundError } from '../../../domain/errors/homework.error'

@Injectable()
export class UpdateHomeworkDynamooseAdapter implements Pick<IHomeworkRepository, 'update'> {
  async update(id: string, changes: UpdateHomeworkDto, updatedAt: string): Promise<HomeworkEntity> {
    try {
      const item = await HomeworkModel.update({ pk: id, sk: 'HOME_WORK' }, {
        $SET: { description: changes.description, updated_at: updatedAt },
      }, { condition: new Condition().where('pk').exists(), returnValues: 'ALL_NEW' })
      return HomeworkMapper.toEntity(item)
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') throw new HomeworkNotFoundError()
      throw error
    }
  }
}
