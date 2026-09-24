import { Injectable } from '@nestjs/common';
import { UserModel } from '../models/user.model';
import { UserMapper } from '../../mappers/user.mapper';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { ICreateUserRepository } from '../../../domain/repositories/create-user.repository';

@Injectable()
export class CreateUserDynamooseAdapter implements ICreateUserRepository {
  private readonly model = UserModel;

  async create(entity: UserEntity): Promise<UserEntity> {
    const data = UserMapper.toPersistence(entity);
    await this.model.create(data, { overwrite: false });
    return entity;
  }
}
