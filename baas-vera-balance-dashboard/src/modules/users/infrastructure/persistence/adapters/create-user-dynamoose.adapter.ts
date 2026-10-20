import { Injectable } from '@nestjs/common';
import { Condition, transaction } from 'dynamoose';
import type { ICreateUserRepository } from '../../../domain/repositories/create-user.repository';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { UserActor } from '../../../domain/services/authorize-user-access.domain-service';
import { UserModel } from '../models/user.model';
import { userAuthorizationChecks } from '../conditions/user-write.condition';
import { UserMapper } from '../../mappers/user.mapper';

@Injectable()
export class CreateUserDynamooseAdapter implements ICreateUserRepository {
  async create(user: UserEntity, actor: UserActor): Promise<void> {
    try {
      await transaction([
        ...userAuthorizationChecks(actor, user.id),
        UserModel.transaction.create(UserMapper.toPersistence(user), {
          condition: new Condition().where('pk').not().exists()
        })
      ]);
    } catch {
      // Persistence errors must never reach the logger with password values.
      throw new Error('Unable to create user.');
    }
  }
}
