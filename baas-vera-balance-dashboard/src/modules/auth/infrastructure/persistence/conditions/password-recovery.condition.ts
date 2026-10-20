import { Condition } from 'dynamoose';
import type { PasswordRecoveryEntity } from '../../../domain/entities/password-recovery.entity';

export function passwordRecoveryCondition(recovery: PasswordRecoveryEntity): Condition {
  return new Condition().where('pk').exists()
    .and().where('code_hash').eq(recovery.codeHash)
    .and().where('created_at').eq(recovery.createdAt)
    .and().where('expires_at').gt(new Date().toISOString())
    .and().where('attempts').eq(recovery.attempts)
    .and().where('attempts').lt(5);
}
