import type { Clinic } from '../entities/clinic.entity'
import type { ClinicChanges } from '../entities/clinic-changes.entity'

export interface UpdateClinicRepository {
  execute(clinicId: string, changes: ClinicChanges): Promise<Clinic>
}
