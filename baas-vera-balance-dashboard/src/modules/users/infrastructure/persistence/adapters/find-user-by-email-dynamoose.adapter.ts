import { Injectable } from '@nestjs/common';
import { UserModel } from '../models/user.model';
import { UserMapper } from '../../mappers/user.mapper';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { IFindUserByEmailRepository } from '../../../domain/repositories/find-user-by-email.repository';
import type { UserPersistence } from '../interfaces/user-persistence.interface';

@Injectable()
export class FindUserByEmailDynamooseAdapter implements IFindUserByEmailRepository {
  private readonly model = UserModel;

  async findByEmail(email: string): Promise<UserEntity | null> {
    const items = await this.model
      .scan()
      .where('sk')
      .eq('USER')
      .where('email')
      .eq(email)
      .consistent()
      .all()
      .exec();

    if (!items.length) {
      return null;
    }

    return UserMapper.toEntity(items[0] as unknown as UserPersistence);
  }
}
