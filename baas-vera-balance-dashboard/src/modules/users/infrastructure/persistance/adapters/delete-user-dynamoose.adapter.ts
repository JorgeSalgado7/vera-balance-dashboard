import { Injectable } from '@nestjs/common'
import { Condition } from 'dynamoose'
import { UserModel } from '../models/user.model'
import type { UserEntity } from '../../../domain/entities/user.entity'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import { UserNotFoundError, UserDeletionConflictError } from '../../../domain/errors/user.error'

@Injectable()
export class DeleteUserDynamooseAdapter implements Pick<IUserRepository, 'delete'> {
  private readonly model = UserModel

  async delete(user: UserEntity): Promise<void> {
    const key = { pk: user.pk, sk: 'USER' }
    const condition = new Condition().where('pk').exists().and().where('updated_at').eq(user.updated_at)

    try {
      await this.model.delete(key, { condition })
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        const current = await this.model.get(key, { consistent: true })
        if (!current) throw new UserNotFoundError()
        throw new UserDeletionConflictError()
      }
      throw error
    }
  }
}
