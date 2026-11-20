import type { UpdateClinicTherapistStatusRepository } from '../../domain/repositories/update-clinic-therapist-status.repository'
import type { ClinicTherapist } from '../../domain/entities/clinic-therapist.entity'
import { locales } from '../../../../locales'

export class UpdateClinicTherapistStatusUseCase {
  private readonly repository: UpdateClinicTherapistStatusRepository

  constructor(repository: UpdateClinicTherapistStatusRepository) {
    this.repository = repository
  }

  execute(userId: string, status: ClinicTherapist['status']) {
    if (!['Activo', 'Inactivo'].includes(status)) throw new Error(locales.clinics.invalidStatus)
    return this.repository.execute(userId, status)
  }
}
