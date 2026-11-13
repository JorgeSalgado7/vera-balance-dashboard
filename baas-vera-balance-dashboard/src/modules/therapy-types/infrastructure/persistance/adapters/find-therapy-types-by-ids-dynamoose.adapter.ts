import { Injectable } from '@nestjs/common'
import { TherapyTypeModel } from '../models/therapy-type.model'
import { TherapyTypeMapper } from '../../mappers/therapy-type.mapper'
import type { ITherapyTypeRepository } from '../../../domain/repositories/therapy-type.repository'
import type { TherapyTypeEntity } from '../../../domain/entities/therapy-type.entity'

@Injectable()
export class FindTherapyTypesByIdsDynamooseAdapter implements Pick<ITherapyTypeRepository, 'findByIds'> {
  private readonly model = TherapyTypeModel

  async findByIds(ids: string[]): Promise<TherapyTypeEntity[]> {
    const uniqueIds = [...new Set(ids)]
    const entities: TherapyTypeEntity[] = []
    for (let offset = 0; offset < uniqueIds.length; offset += 100) {
      const keys = uniqueIds.slice(offset, offset + 100).map(pk => ({ pk, sk: 'THERAPY_TYPE' }))
      const items = await this.model.batchGet(keys)
      if (items.unprocessedKeys?.length) throw new Error('No se pudo completar la consulta de tipos de terapia.')
      entities.push(...items.map(item => TherapyTypeMapper.toEntity(item)))
    }
    return entities
  }
}
