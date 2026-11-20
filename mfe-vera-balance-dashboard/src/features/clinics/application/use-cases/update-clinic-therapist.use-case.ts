import type { UpdateClinicTherapistRepository } from '../../domain/repositories/update-clinic-therapist.repository'
import type { ClinicTherapistChanges } from '../../domain/entities/clinic-therapist-changes.entity'
import { locales } from '../../../../locales'

export class UpdateClinicTherapistUseCase {
  private readonly repository: UpdateClinicTherapistRepository

  constructor(repository: UpdateClinicTherapistRepository) {
    this.repository = repository
  }

  execute(userId: string, changes: ClinicTherapistChanges) {
    if (!changes.name.trim()) throw new Error(locales.clinics.required.therapistName)
    if (!changes.professionalLicense.trim()) throw new Error(locales.clinics.required.professionalLicense)
    if (!['admin', 'clinic', 'therapist'].includes(changes.role)) throw new Error(locales.clinics.invalidRole)
    return this.repository.execute(userId, changes)
  }
}
