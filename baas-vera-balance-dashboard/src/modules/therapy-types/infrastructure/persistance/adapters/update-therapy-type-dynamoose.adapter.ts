import { Injectable } from '@nestjs/common'
import { TherapyTypeModel } from '../models/therapy-type.model'
import { Condition } from 'dynamoose'
import type { ITherapyTypeRepository } from '../../../domain/repositories/therapy-type.repository'
import type { TherapyTypeEntity } from '../../../domain/entities/therapy-type.entity'
import type { UpdateTherapyTypeDto } from '../../../application/dtos/update-therapy-type.dto'
import { TherapyTypeNotFoundError } from '../../../domain/errors/therapy-type-not-found.error'
import { TherapyTypeConflictError } from '../../../domain/errors/therapy-type-conflict.error'
import { TherapyTypeMapper } from '../../mappers/therapy-type.mapper'

@Injectable()
export class UpdateTherapyTypeDynamooseAdapter implements Pick<ITherapyTypeRepository, 'update'> {
  private readonly model = TherapyTypeModel

  async update(entity: TherapyTypeEntity, changes: UpdateTherapyTypeDto, updatedAt: string): Promise<TherapyTypeEntity> {
    const key = { pk: entity.pk, sk: 'THERAPY_TYPE' }
    const set: Record<string, unknown> = { updated_at: updatedAt }
    if (changes.name !== undefined) set.name = changes.name
    if (changes.icon !== undefined) set.icon = changes.icon
    const condition = new Condition().where('pk').exists().and().where('updated_at').eq(entity.updated_at)
    try {
      const item = await this.model.update(key, { $SET: set }, { condition, returnValues: 'ALL_NEW' })
      return TherapyTypeMapper.toEntity(item)
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        if (!await this.model.get(key, { consistent: true })) throw new TherapyTypeNotFoundError()
        throw new TherapyTypeConflictError()
      }
      throw error
    }
  }
}
