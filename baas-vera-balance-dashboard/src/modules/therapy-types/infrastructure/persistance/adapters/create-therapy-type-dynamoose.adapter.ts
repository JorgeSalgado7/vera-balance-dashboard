import { Injectable } from '@nestjs/common'
import { TherapyTypeModel } from '../models/therapy-type.model'
import type { ITherapyTypeRepository } from '../../../domain/repositories/therapy-type.repository'
import type { TherapyTypeEntity } from '../../../domain/entities/therapy-type.entity'
import { TherapyTypeConflictError } from '../../../domain/errors/therapy-type-conflict.error'
import { TherapyTypeMapper } from '../../mappers/therapy-type.mapper'

@Injectable()
export class CreateTherapyTypeDynamooseAdapter implements Pick<ITherapyTypeRepository, 'create'> {
  private readonly model = TherapyTypeModel

  async create(entity: TherapyTypeEntity): Promise<TherapyTypeEntity> {
    try {
      await this.model.create(TherapyTypeMapper.toPersistence(entity), { overwrite: false })
      return entity
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') throw new TherapyTypeConflictError()
      throw error
    }
  }
}
