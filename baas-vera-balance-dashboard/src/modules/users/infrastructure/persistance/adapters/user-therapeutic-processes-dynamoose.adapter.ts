import { Injectable } from '@nestjs/common'
import { UserModel } from '../models/user.model'
import type { IUserRepository } from '../../../domain/repositories/user.repository'

@Injectable()
export class UserTherapeuticProcessesDynamooseAdapter implements Pick<IUserRepository, 'hasTherapeuticProcesses'> {
  private readonly model = UserModel

  async hasTherapeuticProcesses(userId: string): Promise<boolean> {
    let lastKey: Record<string, unknown> | undefined

    do {
      const query = this.model.query('gsi3pk').eq(`THERAPIST#${userId}`).using('GSI3').attributes(['pk']).limit(1)
      if (lastKey) query.startAt(lastKey)

      const items = await query.exec()
      if (items.length > 0) return true
      lastKey = items.lastKey
    } while (lastKey)

    return false
  }
}
