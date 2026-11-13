import { Inject, Injectable } from '@nestjs/common'
import type { IClinicRepository } from '../../domain/repositories/clinic.repository'
import { ResolveClinicTherapyTypesUseCase } from './resolve-clinic-therapy-types.use-case'
import { ClinicNotFoundError } from '../../domain/errors/clinic.error'
import type { GetClinicByIdResponseDto } from '../dtos/get-clinic-by-id-response.dto'

@Injectable()
export class GetClinicByIdUseCase {
  constructor(@Inject('IClinicRepository') private readonly repository: IClinicRepository,
    private readonly therapies: ResolveClinicTherapyTypesUseCase) {}

  async execute(id: string): Promise<GetClinicByIdResponseDto> {
    const saved = await this.repository.findById(id)
    if (!saved) throw new ClinicNotFoundError()
    const therapyTypes = await this.therapies.execute(saved.therapy_types)
    return {
      id: saved.pk,
      name: saved.name,
      logo: saved.logo,
      address: saved.address,
      phone_number: saved.phone_number,
      therapy_types: therapyTypes,
      status: saved.status,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    }
  }
}
