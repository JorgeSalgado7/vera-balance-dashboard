import { USER_ROLES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'
import { Inject, Injectable } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { CreateUserDto } from '../dtos/create-user.dto'
import { CreateUserResponseDto } from '../dtos/create-user-response.dto'

import { CreateUserDomainService } from '../../domain/services/create-user.domain-service'
import type { IUserRepository } from '../../domain/repositories/user.repository'

import { UserAlreadyExistsError, UserCreationNotAllowedError } from '../../domain/errors/user.error'

import type { IHashPasswordService } from '../../../auth/domain/services/hash-password.service'

export interface CreateUserActor {
  id: string
  role: UserRole
  clinic: string | null
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly domain: CreateUserDomainService,

    @Inject('IUserRepository')
    private readonly repository: IUserRepository,

    @Inject('IHashPasswordService')
    private readonly hashPasswordService: IHashPasswordService,
  ) {}

  async execute(dto: CreateUserDto, actor: CreateUserActor): Promise<CreateUserResponseDto> {
    if (actor.role !== USER_ROLES.ADMIN && !(actor.role === USER_ROLES.CLINIC && dto.role === USER_ROLES.THERAPIST && actor.clinic !== null && dto.clinic === actor.clinic)) {
      throw new UserCreationNotAllowedError()
    }

    const email = dto.email.trim().toLowerCase()

    const existingUser = await this.repository.findByEmail(email)

    if (existingUser) {
      throw new UserAlreadyExistsError()
    }

    const password = await this.hashPasswordService.hash(dto.password)

    const now = new Date().toISOString()
    const userId = randomUUID()

    const entity = this.domain.create({
      id: userId,
      name: dto.name.trim(),
      email,
      password,
      professional_license: dto.professional_license.trim(),
      role: dto.role,
      status: 'Activo',
      clinic: dto.clinic,
      created_at: now,
      updated_at: now,
    })

    const saved = await this.repository.create(entity)

    return {
      id: saved.pk,
      name: saved.name,
      email: saved.email,
      professional_license: saved.professional_license,
      role: saved.role,
      status: saved.status,
      clinic: saved.clinic,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    }
  }
}
