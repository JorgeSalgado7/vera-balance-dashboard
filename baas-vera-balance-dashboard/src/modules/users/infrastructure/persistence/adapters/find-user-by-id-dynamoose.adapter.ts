import { Injectable } from '@nestjs/common';
import type { IFindUserByIdRepository } from '../../../domain/repositories/find-user-by-id.repository';
import type { UserPersistence } from '../interfaces/user-persistence.interface';
import { UserModel } from '../models/user.model';
import { UserMapper } from '../../mappers/user.mapper';

@Injectable()
export class FindUserByIdDynamooseAdapter implements IFindUserByIdRepository {
  async findById(id: string) {
    try {
      const item = await UserModel.get({ pk: id, sk: 'USER' }, { consistent: true });
      return item ? UserMapper.toEntity(item as unknown as UserPersistence) : null;
    } catch {
      throw new Error('Unable to read user.');
    }
  }
}
