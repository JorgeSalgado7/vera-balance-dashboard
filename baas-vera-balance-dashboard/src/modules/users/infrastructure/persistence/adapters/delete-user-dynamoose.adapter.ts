import { Injectable } from '@nestjs/common';
import { transaction } from 'dynamoose';
import type { IDeleteUserRepository } from '../../../domain/repositories/delete-user.repository';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { UserActor } from '../../../domain/services/authorize-user-access.domain-service';
import { UserModel } from '../models/user.model';
import { userSnapshotCondition, userAuthorizationChecks } from '../conditions/user-write.condition';
import { UserMutationConflictError } from '../../../domain/errors/user.error';
import { isConditionalTransactionFailure } from '../../../../../infrastructure/dynamoose/is-conditional-transaction-failure';

@Injectable()
export class DeleteUserDynamooseAdapter implements IDeleteUserRepository {
  async delete(current: UserEntity, actor: UserActor, witness?: UserEntity): Promise<void> {
    try {
      await transaction([
        ...userAuthorizationChecks(actor, current.id, witness),
        UserModel.transaction.delete({ pk: current.id, sk: 'USER' }, { condition: userSnapshotCondition(current) })
      ]);
    } catch (error) {
      if (isConditionalTransactionFailure(error)) throw new UserMutationConflictError();
      throw new Error('Unable to delete user.');
    }
  }
}
