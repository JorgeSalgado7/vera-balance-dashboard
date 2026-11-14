import { Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../../domain/repositories/therapeutic-process.repository'
import type { TherapeuticProcessEntity } from '../../../domain/entities/therapeutic-process.entity'
import { TherapeuticProcessModel } from '../models/therapeutic-process.model'
import { TherapeuticProcessMapper } from '../../mappers/therapeutic-process.mapper'

@Injectable()
export class FindTherapeuticProcessesByClinicDynamooseAdapter implements Pick<ITherapeuticProcessRepository, 'findByClinic'> {
  async findByClinic(clinicId: string): Promise<TherapeuticProcessEntity[]> {
    const entities: TherapeuticProcessEntity[] = []
    let lastKey: Record<string, unknown> | undefined
    do {
      const query = TherapeuticProcessModel.query('gsi2pk').eq(`CLINIC#${clinicId}`)
        .where('gsi2sk').beginsWith('THERAPEUTIC_PROCESS#').using('GSI2')
      if (lastKey) query.startAt(lastKey)
      const items = await query.exec()
      entities.push(...items.map(item => TherapeuticProcessMapper.toEntity(item)))
      lastKey = items.lastKey
    } while (lastKey)
    return entities
  }
}
