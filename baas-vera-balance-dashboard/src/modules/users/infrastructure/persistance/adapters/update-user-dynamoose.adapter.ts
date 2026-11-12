import { Injectable } from '@nestjs/common'
import { Condition } from 'dynamoose'
import { UserModel } from '../models/user.model'
import { UserMapper } from '../../mappers/user.mapper'
import type { UserEntity } from '../../../domain/entities/user.entity'
import type { UpdateUserChanges } from '../../../domain/interfaces/update-user-changes'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import { UserNotFoundError, UserUpdateConflictError } from '../../../domain/errors/user.error'
import { UPDATE_USER_FIELDS } from '../../../domain/constants/update-user-fields.constant'

@Injectable()
export class UpdateUserDynamooseAdapter implements Pick<IUserRepository, 'update'> {
  private readonly model = UserModel

  async update(user: UserEntity, changes: UpdateUserChanges, updatedAt: string): Promise<UserEntity> {
    const set: Record<string, unknown> = { updated_at: updatedAt }
    const remove: string[] = []
    for (const field of UPDATE_USER_FIELDS) {
      if (changes[field] !== undefined) set[field] = changes[field]
    }
    if (changes.clinic !== undefined) {
      if (changes.clinic === null) remove.push('gsi2pk', 'gsi2sk')
      else {
        set.gsi2pk = `CLINIC#${changes.clinic}`
        set.gsi2sk = `USER#${user.pk}`
      }
    }

    const key = { pk: user.pk, sk: 'USER' }
    const condition = new Condition().where('pk').exists().and().where('updated_at').eq(user.updated_at)
    try {
      const item = await this.model.update(key, { $SET: set, ...(remove.length ? { $REMOVE: remove } : {}) }, { condition, returnValues: 'ALL_NEW' })
      return UserMapper.toEntity(item)
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        const current = await this.model.get(key, { consistent: true })
        if (!current) throw new UserNotFoundError()
        throw new UserUpdateConflictError()
      }
      throw error
    }
  }
}
