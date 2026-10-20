import { Injectable } from '@nestjs/common';
import type { IFindPasswordRecoveryRepository } from '../../../domain/repositories/find-password-recovery.repository';
import type { PasswordRecoveryPersistence } from '../interfaces/password-recovery-persistence.interface';
import { PasswordRecoveryModel } from '../models/password-recovery.model';
import { PasswordRecoveryMapper } from '../../mappers/password-recovery.mapper';

@Injectable()
export class FindPasswordRecoveryDynamooseAdapter implements IFindPasswordRecoveryRepository {
  async findByUserId(id: string) {
    try {
      const item = await PasswordRecoveryModel.get(
        { pk: id, sk: 'PASSWORD_RECOVERY' }, { consistent: true }
      );
      return item ? PasswordRecoveryMapper.toEntity(item as unknown as PasswordRecoveryPersistence) : null;
    } catch {
      throw new Error('Unable to read password recovery.');
    }
  }
}
