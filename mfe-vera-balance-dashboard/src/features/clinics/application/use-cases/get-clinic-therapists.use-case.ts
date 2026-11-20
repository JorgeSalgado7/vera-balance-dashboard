import type { GetClinicTherapistsRepository } from '../../domain/repositories/get-clinic-therapists.repository'

export class GetClinicTherapistsUseCase {
  private readonly repository: GetClinicTherapistsRepository

  constructor(repository: GetClinicTherapistsRepository) {
    this.repository = repository
  }

  execute(clinicId: string) {
    return this.repository.execute(clinicId)
  }
}
