import { Injectable } from '@nestjs/common'
import { UserModel } from '../models/user.model'
import { UserMapper } from '../../mappers/user.mapper'
import type { IUserRepository } from '../../../domain/repositories/user.repository'
import type { UserEntity } from '../../../domain/entities/user.entity'

@Injectable()
export class FindUsersByIdsDynamooseAdapter implements Pick<IUserRepository, 'findByIds'> {
  private readonly model = UserModel

  async findByIds(ids: string[]): Promise<UserEntity[]> {
    const uniqueIds = [...new Set(ids)]
    const entities: UserEntity[] = []
    for (let offset = 0; offset < uniqueIds.length; offset += 100) {
      const keys = uniqueIds.slice(offset, offset + 100).map(pk => ({ pk, sk: 'USER' }))
      const items = await this.model.batchGet(keys)
      if (items.unprocessedKeys?.length) throw new Error('No se pudo completar la consulta de usuarios.')
      entities.push(...items.map(item => UserMapper.toEntity(item)))
    }
    return entities
  }
}
