import { Inject, Injectable } from '@nestjs/common'
import type { ITherapyTypeRepository } from '../../domain/repositories/therapy-type.repository'
import { UpdateTherapyTypeDomainService } from '../../domain/services/update-therapy-type.domain-service'
import { TherapyTypeNotFoundError } from '../../domain/errors/therapy-type-not-found.error'
import type { UpdateTherapyTypeDto } from '../dtos/update-therapy-type.dto'
import type { UpdateTherapyTypeResponseDto } from '../dtos/update-therapy-type-response.dto'

@Injectable()
export class UpdateTherapyTypeUseCase {
  constructor(
    private readonly domain: UpdateTherapyTypeDomainService,
    @Inject('ITherapyTypeRepository') private readonly repository: ITherapyTypeRepository,
  ) {}

  async execute(id: string, dto: UpdateTherapyTypeDto): Promise<UpdateTherapyTypeResponseDto> {
    const changes = this.domain.execute(dto)
    const entity = await this.repository.findById(id)
    if (!entity) throw new TherapyTypeNotFoundError()
    const updatedAt = new Date(Date.now()).toISOString()
    const result = await this.repository.update(entity, changes, updatedAt)
    return {
      id: result.pk, name: result.name, icon: result.icon,
      created_at: result.created_at, updated_at: result.updated_at,
    }
  }
}
