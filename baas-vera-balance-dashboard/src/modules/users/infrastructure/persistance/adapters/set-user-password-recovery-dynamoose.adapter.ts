import { Injectable } from '@nestjs/common'
import { Condition } from 'dynamoose'
import { UserModel } from '../models/user.model'
import type { ISetUserPasswordRecoveryRepository, SetUserPasswordRecoveryInput } from '../../../domain/repositories/set-user-password-recovery.repository'

@Injectable()
export class SetUserPasswordRecoveryDynamooseAdapter implements ISetUserPasswordRecoveryRepository {
  private readonly model = UserModel

  async set(input: SetUserPasswordRecoveryInput, updatedAt: string): Promise<boolean> {
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
