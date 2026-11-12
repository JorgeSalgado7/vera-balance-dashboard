import { Injectable } from '@nestjs/common'
import { Condition } from 'dynamoose'
import { UserModel } from '../models/user.model'
import type { UserEntity } from '../../../domain/entities/user.entity'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import { UserNotFoundError } from '../../../domain/errors/user.error'

@Injectable()
export class ChangeUserPasswordDynamooseAdapter implements Pick<IUserRepository, 'changePassword'> {
  private readonly model = UserModel

  async changePassword(user: UserEntity, passwordHash: string, updatedAt: string): Promise<void> {
    const key = { pk: user.pk, sk: 'USER' }
    const condition = new Condition().where('pk').exists().and().where('updated_at').eq(user.updated_at).and().where('password').eq(user.password)

    try {
      await this.model.update(key, { $SET: { password: passwordHash, updated_at: updatedAt } }, { condition, returnValues: 'NONE' })
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        const current = await this.model.get(key, { consistent: true })
        if (!current) throw new UserNotFoundError()
      }
      throw new Error('No se pudo actualizar la contraseña del usuario.')
    }
  }
}
