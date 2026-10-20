import { Injectable } from '@nestjs/common';
import type { IFindUserByEmailRepository } from '../../../domain/repositories/find-user-by-email.repository';
import type { UserPersistence } from '../interfaces/user-persistence.interface';
import { UserModel } from '../models/user.model';
import { UserMapper } from '../../mappers/user.mapper';

@Injectable()
export class FindUserByEmailDynamooseAdapter implements IFindUserByEmailRepository {
  async findByEmail(email: string) {
    const items = await UserModel.scan('sk').eq('USER')
      .and().where('email').eq(email.trim().toLowerCase()).consistent().all().exec();
    return items.length ? UserMapper.toEntity(items[0] as unknown as UserPersistence) : null;
  }
}
