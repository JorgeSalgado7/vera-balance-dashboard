import { Injectable } from '@nestjs/common'
import { TherapyTypeModel } from '../models/therapy-type.model'
import type { ITherapyTypeRepository } from '../../../domain/repositories/therapy-type.repository'
import type { TherapyTypeEntity } from '../../../domain/entities/therapy-type.entity'
import { TherapyTypeMapper } from '../../mappers/therapy-type.mapper'

@Injectable()
export class FindTherapyTypeByIdDynamooseAdapter implements Pick<ITherapyTypeRepository, 'findById'> {
  private readonly model = TherapyTypeModel

  async findById(id: string): Promise<TherapyTypeEntity | null> {
    const item = await this.model.get({ pk: id, sk: 'THERAPY_TYPE' }, { consistent: true })
    return item ? TherapyTypeMapper.toEntity(item) : null
  }
}
