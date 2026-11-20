import type { ClinicTherapist } from '../entities/clinic-therapist.entity'
import type { ClinicTherapistChanges } from '../entities/clinic-therapist-changes.entity'

export interface UpdateClinicTherapistRepository {
  execute(userId: string, changes: ClinicTherapistChanges): Promise<ClinicTherapist>
}
