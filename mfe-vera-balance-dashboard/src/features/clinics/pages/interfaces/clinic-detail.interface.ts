import type { UpdateClinicTherapistStatusUseCase } from '../../application/use-cases/update-clinic-therapist-status.use-case'
import type { GetClinicUseCase } from '../../application/use-cases/get-clinic.use-case'
import type { GetClinicTherapistsUseCase } from '../../application/use-cases/get-clinic-therapists.use-case'
import type { UpdateClinicUseCase } from '../../application/use-cases/update-clinic.use-case'

import type { UpdateClinicTherapistUseCase } from '../../application/use-cases/update-clinic-therapist.use-case'

export interface ClinicDetailI {
  getClinic: GetClinicUseCase
  getTherapists: GetClinicTherapistsUseCase
  updateClinic: UpdateClinicUseCase
  updateTherapist: UpdateClinicTherapistUseCase
  updateTherapistStatus: UpdateClinicTherapistStatusUseCase
}
