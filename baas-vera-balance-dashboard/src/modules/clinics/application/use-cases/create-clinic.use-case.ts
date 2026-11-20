import { Inject, Injectable } from '@nestjs/common'
import type { IClinicRepository } from '../../domain/repositories/clinic.repository'
import { ResolveClinicTherapyTypesUseCase } from './resolve-clinic-therapy-types.use-case'
import { EnsureDefaultTherapyTypesUseCase } from '../../../therapy-types/application/use-cases/ensure-default-therapy-types.use-case'
import { randomUUID } from 'crypto'
import { CreateClinicDomainService } from '../../domain/services/create-clinic.domain-service'
import type { CreateClinicDto } from '../dtos/create-clinic.dto'
import type { CreateClinicResponseDto } from '../dtos/create-clinic-response.dto'

@Injectable()
export class CreateClinicUseCase {
  constructor(private readonly domain: CreateClinicDomainService,
    @Inject('IClinicRepository') private readonly repository: IClinicRepository,
    private readonly therapies: ResolveClinicTherapyTypesUseCase,
    private readonly defaultTherapies: EnsureDefaultTherapyTypesUseCase) {}

  async execute(dto: CreateClinicDto): Promise<CreateClinicResponseDto> {
    const now = new Date(Date.now()).toISOString()
    const clinicId = randomUUID()
    const entity = this.domain.create({
      id: clinicId,
      name: dto.name,
      address: dto.address,
      phone_number: dto.phone_number,
      therapy_types: dto.therapy_types === undefined ? [] : dto.therapy_types,
      status: dto.status,
      created_at: now,
      updated_at: now,
    })
    const additionalTypes = await this.therapies.execute(entity.therapy_types)
    const defaults = await this.defaultTherapies.execute()
    const therapyTypes = [...new Map([...defaults, ...additionalTypes].map(item => [item.id, item])).values()]
      .map(item => ({ id: item.id, name: item.name, icon: item.icon }))
    entity.therapy_types = therapyTypes.map(item => item.id)
    const saved = await this.repository.create(entity)
    return {
      id: saved.pk,
      name: saved.name,
      address: saved.address,
      phone_number: saved.phone_number,
      therapy_types: therapyTypes,
      status: saved.status,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    }
  }
}
