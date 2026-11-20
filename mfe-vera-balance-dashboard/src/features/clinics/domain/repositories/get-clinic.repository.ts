import type { Clinic } from '../entities/clinic.entity'

export interface GetClinicRepository {
  execute(clinicId: string): Promise<Clinic>
}
