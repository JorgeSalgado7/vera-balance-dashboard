import { Inject, Injectable } from '@nestjs/common'
import type { ITherapyTypeRepository } from '../../domain/repositories/therapy-type.repository'
import type { FindTherapyTypesByIdsResponseDto } from '../dtos/find-therapy-types-by-ids-response.dto'

@Injectable()
export class FindTherapyTypesByIdsUseCase {
  constructor(@Inject('ITherapyTypeRepository') private readonly repository: ITherapyTypeRepository) {}

  async execute(ids: string[]): Promise<FindTherapyTypesByIdsResponseDto[]> {
    return (await this.repository.findByIds(ids)).map(entity => ({
      id: entity.pk, name: entity.name, icon: entity.icon,
      created_at: entity.created_at, updated_at: entity.updated_at,
    }))
  }
}
