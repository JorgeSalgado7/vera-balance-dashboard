import { Inject, Injectable } from '@nestjs/common'
import type { IClinicRepository } from '../../domain/repositories/clinic.repository'
import { ResolveClinicTherapyTypesUseCase } from './resolve-clinic-therapy-types.use-case'
import { UpdateClinicDomainService } from '../../domain/services/update-clinic.domain-service'
import { ClinicNotFoundError } from '../../domain/errors/clinic.error'
import type { UpdateClinicDto } from '../dtos/update-clinic.dto'
import type { UpdateClinicResponseDto } from '../dtos/update-clinic-response.dto'

@Injectable()
export class UpdateClinicUseCase {
  constructor(private readonly domain: UpdateClinicDomainService,
    @Inject('IClinicRepository') private readonly repository: IClinicRepository,
    private readonly therapies: ResolveClinicTherapyTypesUseCase) {}

  async execute(id: string, dto: UpdateClinicDto): Promise<UpdateClinicResponseDto> {
    const entity = await this.repository.findById(id)
    if (!entity) throw new ClinicNotFoundError()
    const changes = this.domain.execute(entity, dto)
    const therapyTypes = await this.therapies.execute(changes.therapy_types ?? entity.therapy_types)
    const saved = await this.repository.update(entity, changes, new Date(Date.now()).toISOString())
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
