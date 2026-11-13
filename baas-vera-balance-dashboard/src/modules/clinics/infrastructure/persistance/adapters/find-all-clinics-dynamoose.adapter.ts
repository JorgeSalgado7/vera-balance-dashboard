import { Injectable } from '@nestjs/common'
import { ClinicModel } from '../models/clinic.model'
import { ClinicMapper } from '../../mappers/clinic.mapper'
import type { ClinicEntity } from '../../../domain/entities/clinic.entity'
import type { IClinicRepository } from '../../../domain/repositories/clinic.repository'

@Injectable()
export class FindAllClinicsDynamooseAdapter implements Pick<IClinicRepository, 'findAll'> {
  private readonly model = ClinicModel

  async findAll(): Promise<ClinicEntity[]> {
    const result: ClinicEntity[] = []
    let lastKey: Record<string, unknown> | undefined
    do {
      const query = this.model.query('gsi1pk').eq('CLINIC').using('GSI1')
      if (lastKey) query.startAt(lastKey)
      const items = await query.exec()
      result.push(...items.map(item => ClinicMapper.toEntity(item)))
      lastKey = items.lastKey
    } while (lastKey)
    return result
  }
}
