import { Injectable } from '@nestjs/common';
import { transaction } from 'dynamoose';
import type { IUpdateUserRepository } from '../../../domain/repositories/update-user.repository';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { UserActor } from '../../../domain/services/authorize-user-access.domain-service';
import { UserModel } from '../models/user.model';
import { userSnapshotCondition, userAuthorizationChecks } from '../conditions/user-write.condition';
import { UserMutationConflictError } from '../../../domain/errors/user.error';
import { isConditionalTransactionFailure } from '../../../../../infrastructure/dynamoose/is-conditional-transaction-failure';

@Injectable()
export class UpdateUserDynamooseAdapter implements IUpdateUserRepository {
  async update(current: UserEntity, next: UserEntity, actor: UserActor, witness?: UserEntity): Promise<void> {
    try {
      await transaction([
        ...userAuthorizationChecks(actor, current.id, witness),
        UserModel.transaction.update({ pk: current.id, sk: 'USER' }, {
          $SET: { name: next.name, email: next.email, professional_license: next.professionalLicense,
            role: next.role, updated_at: next.updatedAt }
        }, { condition: userSnapshotCondition(current) })
      ]);
    } catch (error) {
      if (isConditionalTransactionFailure(error)) throw new UserMutationConflictError();
      throw new Error('Unable to update user.');
    }
  }
}
