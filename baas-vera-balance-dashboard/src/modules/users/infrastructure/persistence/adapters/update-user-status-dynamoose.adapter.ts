import { Injectable } from '@nestjs/common';
import { Condition } from 'dynamoose';
import { UserModel } from '../models/user.model';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { IUpdateUserStatusRepository } from '../../../domain/repositories/update-user-status.repository';
import { UserNotFoundError } from '../../../domain/errors/user.error';

@Injectable()
export class UpdateUserStatusDynamooseAdapter implements IUpdateUserStatusRepository {
  private readonly model = UserModel;

  async updateStatus(entity: UserEntity): Promise<UserEntity> {
    try {
      await this.model.update(
        { pk: entity.id, sk: 'USER' },
        { status: entity.status, updated_at: entity.updatedAt },
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
