import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { CreateTherapyTypeDto } from '../dtos/create-therapy-type.dto'
import { CreateTherapyTypeResponseDto } from '../dtos/create-therapy-type-response.dto'

import { CreateTherapyTypeDomainService } from '../../domain/services/create-therapy-type.domain-service'
import type { ITherapyTypeRepository } from '../../domain/repositories/therapy-type.repository'

@Injectable()
export class CreateTherapyTypeUseCase {
  constructor(
    private readonly domain: CreateTherapyTypeDomainService,

    @Inject('ITherapyTypeRepository')
    private readonly repository: ITherapyTypeRepository,
  ) {}

  async execute(dto: CreateTherapyTypeDto): Promise<CreateTherapyTypeResponseDto> {
    const now = new Date(Date.now()).toISOString()
    const therapyTypeId = randomUUID()

    const entity = this.domain.create({
      id: therapyTypeId,
      name: dto.name.trim(),
      icon: dto.icon ?? null,
      created_at: now,
      updated_at: now,
    })

    const saved = await this.repository.create(entity)

    return {
      id: saved.pk,
      name: saved.name,
      icon: saved.icon,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    }
  }
}
