import type { ClinicEntity } from '../entities/clinic.entity'
import type { UpdateClinicDto } from '../../application/dtos/update-clinic.dto'

export interface IClinicRepository {
  create(entity: ClinicEntity): Promise<ClinicEntity>
  findAll(): Promise<ClinicEntity[]>
  findById(id: string): Promise<ClinicEntity | null>
  update(entity: ClinicEntity, changes: UpdateClinicDto, updatedAt: string): Promise<ClinicEntity>
}
