import { Injectable } from '@nestjs/common'
import { PatientModel } from '../models/patient.model'
import { PatientMapper } from '../../mappers/patient.mapper'
import type { PatientEntity } from '../../../domain/entities/patient.entity'
import type { IPatientRepository } from '../../../domain/repositories/patient.repository'

@Injectable()
export class FindPatientsByClinicDynamooseAdapter implements Pick<IPatientRepository, 'findByClinic'> {
  private readonly model = PatientModel

  async findByClinic(clinicId: string): Promise<PatientEntity[]> {
    const patients: PatientEntity[] = []
    let lastKey: Record<string, unknown> | undefined

    do {
      const query = this.model.query('gsi2pk').eq(`CLINIC#${clinicId}`).where('gsi2sk').beginsWith('PATIENT#').using('GSI2')

      if (lastKey) {
        query.startAt(lastKey)
      }

      const items = await query.exec()
      patients.push(...items.map((item) => PatientMapper.toEntity(item)))
      lastKey = items.lastKey
    } while (lastKey)

    return patients
  }
}
