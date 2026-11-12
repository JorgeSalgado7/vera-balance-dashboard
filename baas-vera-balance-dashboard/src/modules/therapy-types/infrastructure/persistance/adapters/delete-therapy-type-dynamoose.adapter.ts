import { Injectable } from '@nestjs/common'
import { TherapyTypeModel } from '../models/therapy-type.model'
import { Condition } from 'dynamoose'
import type { ITherapyTypeRepository } from '../../../domain/repositories/therapy-type.repository'
import { TherapyTypeNotFoundError } from '../../../domain/errors/therapy-type-not-found.error'

@Injectable()
export class DeleteTherapyTypeDynamooseAdapter implements Pick<ITherapyTypeRepository, 'delete'> {
  private readonly model = TherapyTypeModel

  async delete(id: string): Promise<void> {
    try {
      await this.model.delete({ pk: id, sk: 'THERAPY_TYPE' }, { condition: new Condition().where('pk').exists() })
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') throw new TherapyTypeNotFoundError()
      throw error
    }
  }
}
