import { Injectable } from '@nestjs/common'
import { UserModel } from '../models/user.model'
import { UserMapper } from '../../mappers/user.mapper'
import type { UserEntity } from '../../../domain/entities/user.entity'
import type { IUserRepository } from '../../../domain/repositories/user.repository'

@Injectable()
export class FindUsersByClinicDynamooseAdapter implements Pick<IUserRepository, 'findByClinic'> {
  private readonly model = UserModel

  async findByClinic(clinicId: string): Promise<UserEntity[]> {
    const users: UserEntity[] = []
    let lastKey: Record<string, unknown> | undefined

    do {
      const query = this.model.query('gsi2pk').eq(`CLINIC#${clinicId}`).where('gsi2sk').beginsWith('USER#').using('GSI2').attributes(['pk', 'sk', 'name', 'email', 'professional_license', 'role', 'status', 'clinic', 'created_at', 'updated_at'])

      if (lastKey) {
        query.startAt(lastKey)
      }

      const items = await query.exec()
      users.push(...items.map((item) => UserMapper.toEntity(item)))
      lastKey = items.lastKey
    } while (lastKey)

    return users
  }
}
