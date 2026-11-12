import type { IUserRepository } from '../../domain/repositories/user.repository'

export class FindUserByEmailUseCase {
  constructor(private readonly repository: Pick<IUserRepository, 'findByEmail'>) {}

  async execute(email: string) {
    const user = await this.repository.findByEmail(email.trim().toLowerCase())
    if (!user) return null

    return {
      id: user.pk,
      name: user.name,
      email: user.email,
      password: user.password,
      password_recovery_code_hash: user.password_recovery_code_hash,
      password_recovery_expires_at: user.password_recovery_expires_at,
      professional_license: user.professional_license,
      role: user.role,
      status: user.status,
      clinic: user.clinic,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  }
}
