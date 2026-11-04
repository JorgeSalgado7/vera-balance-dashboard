import { Injectable } from '@nestjs/common'
import { Condition } from 'dynamoose'
import { UserModel } from '../models/user.model'
import { UserMapper } from '../mappers/user.mapper'
import type { UserEntity } from '../../domain/entities/user.entity'
import type { IUpdateUserStatusRepository } from '../../domain/repositories/update-user-status.repository'
import { UserNotFoundError } from '../../domain/errors/user-not-found.error'

@Injectable()
export class UpdateUserStatusDynamooseAdapter implements IUpdateUserStatusRepository {
  private readonly model = UserModel

  async updateStatus(user: UserEntity, status: UserEntity['status'], updatedAt: string): Promise<UserEntity> {
    const key = { pk: user.pk, sk: 'USER' }
    const condition = new Condition().where('pk').exists().and().where('updated_at').eq(user.updated_at)

    try {
      const item = await this.model.update(key, { $SET: { status, updated_at: updatedAt } }, { condition, returnValues: 'ALL_NEW' })
      return UserMapper.toEntity(item)
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        const current = await this.model.get(key, { consistent: true })
        if (!current) throw new UserNotFoundError()
      }
      throw error
    }
  }
}
