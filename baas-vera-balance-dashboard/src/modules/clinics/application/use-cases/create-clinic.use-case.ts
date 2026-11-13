import { Inject, Injectable } from '@nestjs/common'
import type { IClinicRepository } from '../../domain/repositories/clinic.repository'
import { ResolveClinicTherapyTypesUseCase } from './resolve-clinic-therapy-types.use-case'
import { randomUUID } from 'crypto'
import { CreateClinicDomainService } from '../../domain/services/create-clinic.domain-service'
import type { CreateClinicDto } from '../dtos/create-clinic.dto'
import type { CreateClinicResponseDto } from '../dtos/create-clinic-response.dto'

@Injectable()
export class CreateClinicUseCase {
  constructor(private readonly domain: CreateClinicDomainService,
    @Inject('IClinicRepository') private readonly repository: IClinicRepository,
    private readonly therapies: ResolveClinicTherapyTypesUseCase) {}

  async execute(dto: CreateClinicDto): Promise<CreateClinicResponseDto> {
    const now = new Date(Date.now()).toISOString()
    const clinicId = randomUUID()
    const entity = this.domain.create({
      id: clinicId,
      name: dto.name,
      logo: dto.logo ?? null,
      address: dto.address,
      phone_number: dto.phone_number,
      therapy_types: dto.therapy_types,
      status: dto.status,
      created_at: now,
      updated_at: now,
    })
    const therapyTypes = await this.therapies.execute(entity.therapy_types)
    const saved = await this.repository.create(entity)
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
