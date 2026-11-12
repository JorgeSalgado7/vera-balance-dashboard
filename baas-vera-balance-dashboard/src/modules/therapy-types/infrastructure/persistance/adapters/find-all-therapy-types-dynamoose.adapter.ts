import { Injectable } from '@nestjs/common'
import { TherapyTypeModel } from '../models/therapy-type.model'
import type { ITherapyTypeRepository } from '../../../domain/repositories/therapy-type.repository'
import type { TherapyTypeEntity } from '../../../domain/entities/therapy-type.entity'
import { TherapyTypeMapper } from '../../mappers/therapy-type.mapper'

@Injectable()
export class FindAllTherapyTypesDynamooseAdapter implements Pick<ITherapyTypeRepository, 'findAll'> {
  private readonly model = TherapyTypeModel

  async findAll(): Promise<TherapyTypeEntity[]> {
    const entities: TherapyTypeEntity[] = []
    let lastKey: Record<string, unknown> | undefined
    do {
      const query = this.model.query('gsi1pk').eq('THERAPY_TYPE').using('GSI1')
      if (lastKey) query.startAt(lastKey)
      const items = await query.exec()
      entities.push(...items.map(item => TherapyTypeMapper.toEntity(item)))
      lastKey = items.lastKey
    } while (lastKey)
    return entities
  }
}
