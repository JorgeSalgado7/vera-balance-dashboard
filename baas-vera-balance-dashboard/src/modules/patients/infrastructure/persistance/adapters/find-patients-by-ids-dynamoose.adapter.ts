import { Injectable } from '@nestjs/common'
import { PatientModel } from '../models/patient.model'
import { PatientMapper } from '../../mappers/patient.mapper'
import type { IPatientRepository } from '../../../domain/repositories/patient.repository'
import type { PatientEntity } from '../../../domain/entities/patient.entity'

@Injectable()
export class FindPatientsByIdsDynamooseAdapter implements Pick<IPatientRepository, 'findByIds'> {
  private readonly model = PatientModel

  async findByIds(ids: string[]): Promise<PatientEntity[]> {
    const uniqueIds = [...new Set(ids)]
    const entities: PatientEntity[] = []
    for (let offset = 0; offset < uniqueIds.length; offset += 100) {
      const keys = uniqueIds.slice(offset, offset + 100).map(pk => ({ pk, sk: 'PATIENT' }))
      const items = await this.model.batchGet(keys)
      if (items.unprocessedKeys?.length) throw new Error('No se pudo completar la consulta de pacientes.')
      entities.push(...items.map(item => PatientMapper.toEntity(item)))
    }
    return entities
  }
}
