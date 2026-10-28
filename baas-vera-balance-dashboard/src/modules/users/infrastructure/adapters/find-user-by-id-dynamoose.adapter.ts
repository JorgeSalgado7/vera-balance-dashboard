import { Injectable } from '@nestjs/common'

import { UserModel } from '../models/user.model'
import { UserMapper } from '../mappers/user.mapper'

import type { IUserRepository } from '../../domain/repositories/user.repository'
import type { UserEntity } from '../../domain/entities/user.entity'

@Injectable()
export class FindUserByIdDynamooseAdapter implements Pick<IUserRepository, 'findById'> {
  private readonly model = UserModel

  async findById(id: string): Promise<UserEntity | null> {
    const item = await this.model.get({ pk: id, sk: 'USER'})
    return item ? UserMapper.toEntity(item) : null
  }
}
