import type { IUserRepository } from '../../domain/repositories/user.repository'
import { UserNotFoundError } from '../../domain/errors/user.error'
import type { GetUserByIdResponseDto } from '../dtos/get-user-by-id-response.dto'

export class GetUserByIdUseCase {
  constructor(
    private readonly repository: Pick<IUserRepository, 'findById'>,
  ) {}

  async execute(userId: string): Promise<GetUserByIdResponseDto> {
    const user = await this.repository.findById(userId)

    if (!user) {
      throw new UserNotFoundError()
    }

    return {
      id: user.pk,
      name: user.name,
      email: user.email,
      professional_license: user.professional_license,
      role: user.role,
      status: user.status,
      clinic: user.clinic,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  }
}
