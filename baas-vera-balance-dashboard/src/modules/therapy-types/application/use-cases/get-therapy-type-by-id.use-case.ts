import { Inject, Injectable } from '@nestjs/common'
import type { ITherapyTypeRepository } from '../../domain/repositories/therapy-type.repository'
import { TherapyTypeNotFoundError } from '../../domain/errors/therapy-type-not-found.error'
import type { GetTherapyTypeByIdResponseDto } from '../dtos/get-therapy-type-by-id-response.dto'

@Injectable()
export class GetTherapyTypeByIdUseCase {
  constructor(@Inject('ITherapyTypeRepository') private readonly repository: ITherapyTypeRepository) {}

  async execute(id: string): Promise<GetTherapyTypeByIdResponseDto> {
    const entity = await this.repository.findById(id)
    if (!entity) throw new TherapyTypeNotFoundError()
    return {
      id: entity.pk, name: entity.name, icon: entity.icon,
      created_at: entity.created_at, updated_at: entity.updated_at,
    }
  }
}
