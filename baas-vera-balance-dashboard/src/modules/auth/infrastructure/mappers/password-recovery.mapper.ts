import { PasswordRecoveryEntity } from '../../domain/entities/password-recovery.entity';
import type { PasswordRecoveryPersistence } from '../persistence/interfaces/password-recovery-persistence.interface';

export class PasswordRecoveryMapper {
  static toPersistence(entity: PasswordRecoveryEntity): PasswordRecoveryPersistence {
    return {
      pk: entity.userId,
      sk: 'PASSWORD_RECOVERY',
      code_hash: entity.codeHash,
      expires_at: entity.expiresAt,
      attempts: entity.attempts,
      created_at: entity.createdAt,
      ttl: entity.ttl
    };
  }

  static toEntity(item: PasswordRecoveryPersistence): PasswordRecoveryEntity {
    const entity = new PasswordRecoveryEntity();
    entity.userId = item.pk;
    entity.codeHash = item.code_hash;
    entity.expiresAt = item.expires_at;
    entity.attempts = item.attempts;
    entity.createdAt = item.created_at;
    entity.ttl = item.ttl;
    return entity;
  }
}
