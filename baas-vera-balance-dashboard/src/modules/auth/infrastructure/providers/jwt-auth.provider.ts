import type { UserRole } from '../../../../constants/user-roles.constant'
import { Inject, Injectable } from '@nestjs/common'

import { AuthenticationRegistry, JwtBearerProvider, type JwtClaims } from '@nestjs/authentication'

import type { IUserRepository } from '../../../users/domain/repositories/user.repository'

export interface AuthenticatedUser {
  id: string
  role: UserRole
  clinic: string | null
}

@Injectable()
export class JwtAuthProvider extends JwtBearerProvider<AuthenticatedUser> {
  constructor(
    @Inject('IUserRepository')
    private readonly usersRepository: IUserRepository,
    registry: AuthenticationRegistry,
  ) {
    super({ realm: 'vera-balance' })

    registry.registerProvider(this)
  }

  async validate({ sub }: JwtClaims): Promise<AuthenticatedUser | null> {
    if (!sub) {
      return null
    }

    const user = await this.usersRepository.findById(sub)

    if (!user || user.status !== 'Activo') {
      return null
    }

    return {
      id: user.pk,
      role: user.role,
      clinic: user.clinic,
    }
  }
}
