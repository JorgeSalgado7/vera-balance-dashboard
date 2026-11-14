import type { TherapeuticProcessEntity } from '../entities/therapeutic-process.entity'
import type { UpdateTherapeuticProcessDto } from '../../application/dtos/update-therapeutic-process.dto'

export interface ITherapeuticProcessRepository {
  create(entity: TherapeuticProcessEntity): Promise<TherapeuticProcessEntity>
  findById(id: string): Promise<TherapeuticProcessEntity | null>
  findByClinic(clinicId: string): Promise<TherapeuticProcessEntity[]>
  findByPatient(patientId: string): Promise<TherapeuticProcessEntity[]>
  update(entity: TherapeuticProcessEntity, changes: UpdateTherapeuticProcessDto, updatedAt: string): Promise<TherapeuticProcessEntity>
  updateStatus(id: string, status: TherapeuticProcessEntity['status'], updatedAt: string): Promise<TherapeuticProcessEntity>
  deleteCascade(entity: TherapeuticProcessEntity): Promise<void>
}
