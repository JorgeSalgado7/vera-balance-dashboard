import type { ClinicTherapist } from '../entities/clinic-therapist.entity'

export interface GetClinicTherapistsRepository {
  execute(clinicId: string): Promise<ClinicTherapist[]>
}
