import { Inject, Injectable } from '@nestjs/common'
import type { IUserRepository } from '../../domain/repositories/user.repository'
import type { FindUsersByIdsResponseDto } from '../dtos/find-users-by-ids-response.dto'

@Injectable()
export class FindUsersByIdsUseCase {
  constructor(@Inject('IUserRepository') private readonly repository: Pick<IUserRepository, 'findByIds'>) {}

  async execute(ids: string[]): Promise<FindUsersByIdsResponseDto[]> {
    return (await this.repository.findByIds(ids)).map(entity => ({
      id: entity.pk,
      name: entity.name,
      email: entity.email,
      professional_license: entity.professional_license,
      role: entity.role,
      status: entity.status,
      clinic: entity.clinic,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    }))
  }
}
