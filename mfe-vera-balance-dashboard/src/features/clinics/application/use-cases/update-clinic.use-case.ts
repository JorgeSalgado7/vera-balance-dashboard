import type { UpdateClinicRepository } from '../../domain/repositories/update-clinic.repository'
import type { ClinicChanges } from '../../domain/entities/clinic-changes.entity'
import { locales } from '../../../../locales'

export class UpdateClinicUseCase {
  private readonly repository: UpdateClinicRepository

  constructor(repository: UpdateClinicRepository) {
    this.repository = repository
  }

  execute(clinicId: string, changes: ClinicChanges) {
    if (changes.name !== undefined && !changes.name.trim()) throw new Error(locales.clinics.required.name)
    if (changes.address !== undefined && !changes.address.trim()) throw new Error(locales.clinics.required.address)
    if (changes.phoneNumber !== undefined && !changes.phoneNumber.trim()) throw new Error(locales.clinics.required.phoneNumber)
    return this.repository.execute(clinicId, changes)
  }
}
