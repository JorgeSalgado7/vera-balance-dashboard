import type { SetUserPasswordRecoveryDto } from '../../../application/dtos/set-user-password-recovery.dto'
import { Injectable } from '@nestjs/common'
import { Condition } from 'dynamoose'
import { UserModel } from '../models/user.model'
import type { IUserRepository } from '../../../domain/repositories/user.repository'

@Injectable()
export class SetUserPasswordRecoveryDynamooseAdapter implements Pick<IUserRepository, 'set'> {
  private readonly model = UserModel

  async set(input: SetUserPasswordRecoveryDto, updatedAt: string): Promise<boolean> {
    const condition = new Condition().where('pk').exists().and().where('password').eq(input.currentPasswordHash)
    try {
      await this.model.update({ pk: input.userId, sk: 'USER' }, {
        $SET: {
          password_recovery_code_hash: input.codeHash,
          password_recovery_expires_at: input.expiresAt,
          updated_at: updatedAt,
        },
      }, { condition, returnValues: 'NONE' })
      return true
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') return false
      throw error
    }
  }
}
