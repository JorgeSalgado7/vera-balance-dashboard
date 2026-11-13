import { Injectable } from '@nestjs/common'
import { PatientModel } from '../models/patient.model'
import { PatientMapper } from '../../mappers/patient.mapper'
import type { PatientEntity } from '../../../domain/entities/patient.entity'
import type { IPatientRepository } from '../../../domain/repositories/patient.repository'

@Injectable()
export class FindPatientByIdDynamooseAdapter implements Pick<IPatientRepository, 'findById'> {
  private readonly model = PatientModel

  async findById(id: string): Promise<PatientEntity | null> {
    const item = await this.model.get({ pk: id, sk: 'PATIENT' }, { consistent: true })
    return item ? PatientMapper.toEntity(item) : null
  }
}
