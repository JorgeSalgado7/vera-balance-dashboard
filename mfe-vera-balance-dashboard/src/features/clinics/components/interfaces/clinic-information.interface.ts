import type { Clinic } from '../../domain/entities/clinic.entity'
import type { UpdateClinicUseCase } from '../../application/use-cases/update-clinic.use-case'

export interface ClinicInformationI {
  clinic: Clinic
  canEdit: boolean
  updateClinic: UpdateClinicUseCase
  onSaved: (clinic: Clinic) => void
}
