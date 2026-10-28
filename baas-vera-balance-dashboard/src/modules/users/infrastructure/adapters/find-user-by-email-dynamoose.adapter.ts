import { Injectable } from '@nestjs/common'

import { UserModel } from '../models/user.model'
import { UserMapper } from '../mappers/user.mapper'

import type { UserEntity } from '../../domain/entities/user.entity'
import type { IUserRepository } from '../../domain/repositories/user.repository'

@Injectable()
export class FindUserByEmailDynamooseAdapter implements Pick<IUserRepository, 'findByEmail'> {
  private readonly model = UserModel

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalizedEmail = email.trim().toLowerCase()

    const items = await this.model.query('gsi2pk').eq(`EMAIL#${normalizedEmail}`).using('GSI2').limit(1).exec()

    if (!items || items.length === 0) {
      return null
    }

    return UserMapper.toEntity(items[0])
  }
}
