import type { GetClinicRepository } from '../../domain/repositories/get-clinic.repository'

export class GetClinicUseCase {
  private readonly repository: GetClinicRepository

  constructor(repository: GetClinicRepository) {
    this.repository = repository
  }

  execute(clinicId: string) {
    return this.repository.execute(clinicId)
  }
}
