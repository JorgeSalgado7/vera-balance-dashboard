import { Condition } from 'dynamoose';
import type { UserEntity } from '../../../domain/entities/user.entity';
import type { UserActor } from '../../../domain/services/authorize-user-access.domain-service';
import { UserModel } from '../models/user.model';

export function userSnapshotCondition(user: UserEntity): Condition {
  return new Condition().where('pk').exists()
    .and().where('clinic.pk').eq(user.clinicId)
    .and().where('updated_at').eq(user.updatedAt)
    .and().where('role').eq(user.role).and().where('status').eq(user.status)
    .and().where('email').eq(user.email).and().where('name').eq(user.name)
    .and().where('professional_license').eq(user.professionalLicense);
}

export function userAuthorizationChecks(actor: UserActor, targetId: string, witness?: UserEntity) {
  const checks = [];
  if (actor.id !== targetId) {
    checks.push(UserModel.transaction.condition({ pk: actor.id, sk: 'USER' },
      new Condition().where('pk').exists().and().where('status').eq('active')
        .and().where('role').eq(actor.role).and().where('clinic.pk').eq(actor.clinicId)));
  }
  if (witness && witness.id !== actor.id && witness.id !== targetId) {
    checks.push(UserModel.transaction.condition({ pk: witness.id, sk: 'USER' },
      new Condition().where('pk').exists().and().where('status').eq('active')
        .and().where('role').eq('clinic').and().where('clinic.pk').eq(actor.clinicId)));
  }
  return checks;
}
