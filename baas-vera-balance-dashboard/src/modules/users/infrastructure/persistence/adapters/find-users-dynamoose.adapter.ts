import { Injectable } from '@nestjs/common';
import { UserModel } from '../models/user.model';
import { UserMapper } from '../../mappers/user.mapper';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { IFindUsersRepository } from '../../../domain/repositories/find-users.repository';
import type { UserPersistence } from '../interfaces/user-persistence.interface';

@Injectable()
export class FindUsersDynamooseAdapter implements IFindUsersRepository {
  private readonly model = UserModel;

  async findAll(): Promise<UserEntity[]> {
    const items = await this.model
      .scan()
      .where('sk')
      .eq('USER')
      .all()
      .exec();

    return items.map((item) => UserMapper.toEntity(item as unknown as UserPersistence));
  }
}
