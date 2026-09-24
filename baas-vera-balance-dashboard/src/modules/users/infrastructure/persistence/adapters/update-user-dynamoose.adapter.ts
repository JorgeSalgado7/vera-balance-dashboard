import { Injectable } from '@nestjs/common';
import { Condition } from 'dynamoose';
import { UserModel } from '../models/user.model';
import { UserMapper } from '../../mappers/user.mapper';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { IUpdateUserRepository } from '../../../domain/repositories/update-user.repository';
import { UserNotFoundError } from '../../../domain/errors/user.error';

@Injectable()
export class UpdateUserDynamooseAdapter implements IUpdateUserRepository {
  private readonly model = UserModel;

  async update(entity: UserEntity): Promise<UserEntity> {
    const data = UserMapper.toPersistence(entity);
    try {
      await this.model.update(
        { pk: data.pk, sk: data.sk },
        {
          name: data.name,
          email: data.email,
          professional_license: data.professional_license,
          clinic: data.clinic,
          role: data.role,
          status: data.status,
          updated_at: data.updated_at
        },
        { condition: new Condition().where('pk').exists() }
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
        throw new UserNotFoundError();
      }
      throw error;
    }
    return entity;
  }
}
