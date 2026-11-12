import type { IUserRepository } from '../../domain/repositories/user.repository'
import type { GetUsersResponseDto } from '../dtos/get-users-response.dto'

export class GetUsersUseCase {
  constructor(private readonly repository: Pick<IUserRepository, 'findAll'>) {}

  async execute(): Promise<GetUsersResponseDto[]> {
    const users = await this.repository.findAll()

    return users.map((user) => ({
      id: user.pk,
      name: user.name,
      email: user.email,
      professional_license: user.professional_license,
      role: user.role,
      status: user.status,
      clinic: user.clinic,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }))
  }
}
