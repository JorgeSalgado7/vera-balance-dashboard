import { Injectable } from '@nestjs/common';
import { UserModel } from '../models/user.model';
import { UserMapper } from '../../mappers/user.mapper';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { IFindUserByIdRepository } from '../../../domain/repositories/find-user-by-id.repository';
import type { UserPersistence } from '../interfaces/user-persistence.interface';

@Injectable()
export class FindUserByIdDynamooseAdapter implements IFindUserByIdRepository {
  private readonly model = UserModel;

  async findById(userId: string): Promise<UserEntity | null> {
    const item = await this.model.get({ pk: userId, sk: 'USER' });

    if (!item) {
      return null;
    }

    return UserMapper.toEntity(
      item as unknown as UserPersistence
    );
  }
}
