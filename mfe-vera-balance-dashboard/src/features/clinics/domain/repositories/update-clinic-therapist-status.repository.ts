import type { ClinicTherapist } from '../entities/clinic-therapist.entity'

export interface UpdateClinicTherapistStatusRepository {
  execute(userId: string, status: ClinicTherapist['status']): Promise<ClinicTherapist>
}
