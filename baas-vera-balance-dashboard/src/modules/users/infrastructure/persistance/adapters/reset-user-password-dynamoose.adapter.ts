import type { ResetUserPasswordDto } from '../../../application/dtos/reset-user-password.dto'
import { Injectable } from '@nestjs/common'
import { Condition } from 'dynamoose'
import { UserModel } from '../models/user.model'
import type { IUserRepository } from '../../../domain/repositories/user.repository'

@Injectable()
export class ResetUserPasswordDynamooseAdapter implements Pick<IUserRepository, 'reset'> {
  private readonly model = UserModel

  async reset(input: ResetUserPasswordDto, updatedAt: string): Promise<boolean> {
    const condition = new Condition().where('pk').exists()
      .and().where('password').eq(input.currentPasswordHash)
      .and().where('password_recovery_code_hash').eq(input.codeHash)
      .and().where('password_recovery_expires_at').eq(input.expiresAt)
      .and().where('password_recovery_expires_at').gt(updatedAt)
    try {
      await this.model.update({ pk: input.userId, sk: 'USER' }, {
        $SET: { password: input.passwordHash, updated_at: updatedAt },
        $REMOVE: ['password_recovery_code_hash', 'password_recovery_expires_at'],
      }, { condition, returnValues: 'NONE' })
      return true
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') return false
      throw error
    }
  }
}
