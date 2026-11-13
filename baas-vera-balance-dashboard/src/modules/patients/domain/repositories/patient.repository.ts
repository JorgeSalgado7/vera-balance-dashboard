import type { PatientEntity } from '../entities/patient.entity'
import type { UpdatePatientDto } from '../../application/dtos/update-patient.dto'

export interface IPatientRepository {
  create(entity: PatientEntity): Promise<PatientEntity>
  findById(id: string): Promise<PatientEntity | null>
  findByClinic(clinicId: string): Promise<PatientEntity[]>
  update(entity: PatientEntity, changes: UpdatePatientDto, updatedAt: string): Promise<PatientEntity>
}
