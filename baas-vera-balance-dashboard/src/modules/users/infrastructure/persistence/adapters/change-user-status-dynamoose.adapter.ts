import { Injectable } from '@nestjs/common';
import { transaction } from 'dynamoose';
import type { IChangeUserStatusRepository } from '../../../domain/repositories/change-user-status.repository';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { UserActor } from '../../../domain/services/authorize-user-access.domain-service';
import { UserModel } from '../models/user.model';
import { userSnapshotCondition, userAuthorizationChecks } from '../conditions/user-write.condition';
import { UserMutationConflictError } from '../../../domain/errors/user.error';
import { isConditionalTransactionFailure } from '../../../../../infrastructure/dynamoose/is-conditional-transaction-failure';

@Injectable()
export class ChangeUserStatusDynamooseAdapter implements IChangeUserStatusRepository {
  async change(current: UserEntity, next: UserEntity, actor: UserActor, witness?: UserEntity): Promise<void> {
    try {
      await transaction([
        ...userAuthorizationChecks(actor, current.id, witness),
        UserModel.transaction.update({ pk: current.id, sk: 'USER' }, {
          $SET: { status: next.status, updated_at: next.updatedAt }
        }, { condition: userSnapshotCondition(current) })
      ]);
    } catch (error) {
      if (isConditionalTransactionFailure(error)) throw new UserMutationConflictError();
      throw new Error('Unable to change user status.');
    }
  }
}
