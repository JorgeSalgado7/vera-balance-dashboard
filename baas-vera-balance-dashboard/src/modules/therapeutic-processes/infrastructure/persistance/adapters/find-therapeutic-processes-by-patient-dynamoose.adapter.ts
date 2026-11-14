import { Injectable } from '@nestjs/common'
import type { ITherapeuticProcessRepository } from '../../../domain/repositories/therapeutic-process.repository'
import type { TherapeuticProcessEntity } from '../../../domain/entities/therapeutic-process.entity'
import { TherapeuticProcessModel } from '../models/therapeutic-process.model'
import { TherapeuticProcessMapper } from '../../mappers/therapeutic-process.mapper'
import { PatientTherapeuticProcessModel } from '../models/patient-therapeutic-process.model'

@Injectable()
export class FindTherapeuticProcessesByPatientDynamooseAdapter implements Pick<ITherapeuticProcessRepository, 'findByPatient'> {
  async findByPatient(patientId: string): Promise<TherapeuticProcessEntity[]> {
    const ids = new Set<string>()
    let lastKey: Record<string, unknown> | undefined
    do {
      const query = PatientTherapeuticProcessModel.query('pk').eq(`PATIENT#${patientId}`)
        .where('sk').beginsWith('THERAPEUTIC_PROCESS#').consistent()
      if (lastKey) query.startAt(lastKey)
      const items = await query.exec()
      for (const item of items) ids.add(item.sk.slice('THERAPEUTIC_PROCESS#'.length))
      lastKey = items.lastKey
    } while (lastKey)
    const keys = [...ids].map(pk => ({ pk, sk: 'THERAPEUTIC_PROCESS' }))
    const entities: TherapeuticProcessEntity[] = []
    for (let offset = 0; offset < keys.length; offset += 100) {
      const items = await TherapeuticProcessModel.batchGet(keys.slice(offset, offset + 100))
      if (items.unprocessedKeys?.length) throw new Error('No se pudo completar la consulta de procesos terapéuticos.')
      if (items.length !== keys.slice(offset, offset + 100).length) throw new Error('No se pudieron recuperar todos los procesos relacionados con el paciente.')
      entities.push(...items.map(item => TherapeuticProcessMapper.toEntity(item)))
    }
    return entities
  }
}
