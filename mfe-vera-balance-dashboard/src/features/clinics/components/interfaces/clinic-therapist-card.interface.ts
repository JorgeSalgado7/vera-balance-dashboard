import type { UpdateClinicTherapistStatusUseCase } from '../../application/use-cases/update-clinic-therapist-status.use-case'
import type { ClinicTherapist } from '../../domain/entities/clinic-therapist.entity'
import type { UpdateClinicTherapistUseCase } from '../../application/use-cases/update-clinic-therapist.use-case'

export interface ClinicTherapistCardI {
  therapist: ClinicTherapist
  canEdit: boolean
  updateTherapist: UpdateClinicTherapistUseCase
  updateTherapistStatus: UpdateClinicTherapistStatusUseCase
  onSaved: (therapist: ClinicTherapist) => void
}
