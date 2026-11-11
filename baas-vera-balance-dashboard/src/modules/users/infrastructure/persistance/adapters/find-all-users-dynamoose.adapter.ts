import { Injectable } from '@nestjs/common'
import { UserModel } from '../models/user.model'
import { UserMapper } from '../../mappers/user.mapper'
import type { UserEntity } from '../../../domain/entities/user.entity'
import type { IFindAllUsersRepository } from '../../../domain/repositories/find-all-users.repository'

@Injectable()
export class FindAllUsersDynamooseAdapter implements IFindAllUsersRepository {
  private readonly model = UserModel

  async findAll(): Promise<UserEntity[]> {
    const users: UserEntity[] = []
    let lastKey: Record<string, unknown> | undefined

    do {
      const query = this.model.query('gsi1pk').eq('USER').using('GSI1').attributes(['pk', 'sk', 'name', 'email', 'professional_license', 'role', 'status', 'clinic', 'created_at', 'updated_at'])

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
