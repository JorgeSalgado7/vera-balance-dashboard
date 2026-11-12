import { Inject, Injectable } from '@nestjs/common'
import type { ITherapyTypeRepository } from '../../domain/repositories/therapy-type.repository'
import type { GetTherapyTypesResponseDto } from '../dtos/get-therapy-types-response.dto'

@Injectable()
export class GetTherapyTypesUseCase {
  constructor(@Inject('ITherapyTypeRepository') private readonly repository: ITherapyTypeRepository) {}

  async execute(): Promise<GetTherapyTypesResponseDto[]> {
    return (await this.repository.findAll()).map(entity => ({
      id: entity.pk, name: entity.name, icon: entity.icon,
      created_at: entity.created_at, updated_at: entity.updated_at,
    }))
  }
}
