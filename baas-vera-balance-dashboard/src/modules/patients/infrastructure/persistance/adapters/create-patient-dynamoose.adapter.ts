import { Injectable } from '@nestjs/common'
import { PatientModel } from '../models/patient.model'
import { PatientMapper } from '../../mappers/patient.mapper'
import type { PatientEntity } from '../../../domain/entities/patient.entity'
import type { IPatientRepository } from '../../../domain/repositories/patient.repository'

@Injectable()
export class CreatePatientDynamooseAdapter implements Pick<IPatientRepository, 'create'> {
  private readonly model = PatientModel

  async create(entity: PatientEntity): Promise<PatientEntity> {
    await this.model.create(PatientMapper.toPersistence(entity), { overwrite: false })
    return entity
  }
}
