import { Inject, Injectable } from '@nestjs/common'
import type { IClinicRepository } from '../../domain/repositories/clinic.repository'
import { ClinicNotFoundError } from '../../domain/errors/clinic.error'
import { GetUsersByClinicUseCase } from '../../../users/application/use-cases/get-users-by-clinic.use-case'
import type { GetUsersResponseDto } from '../../../users/application/dtos/get-users-response.dto'

@Injectable()
export class GetClinicUsersUseCase {
  constructor(@Inject('IClinicRepository') private readonly repository: IClinicRepository,
    private readonly users: GetUsersByClinicUseCase) {}

  async execute(clinicId: string): Promise<GetUsersResponseDto[]> {
    if (!await this.repository.findById(clinicId)) throw new ClinicNotFoundError()
    return this.users.execute(clinicId)
  }
}
