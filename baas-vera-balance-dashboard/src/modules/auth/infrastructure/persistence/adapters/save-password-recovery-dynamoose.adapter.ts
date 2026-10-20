import { Injectable } from '@nestjs/common';
import type { ISavePasswordRecoveryRepository } from '../../../domain/repositories/save-password-recovery.repository';
import type { PasswordRecoveryEntity } from '../../../domain/entities/password-recovery.entity';
import { PasswordRecoveryModel } from '../models/password-recovery.model';
import { PasswordRecoveryMapper } from '../../mappers/password-recovery.mapper';

@Injectable()
export class SavePasswordRecoveryDynamooseAdapter implements ISavePasswordRecoveryRepository {
  async save(recovery: PasswordRecoveryEntity): Promise<void> {
    await PasswordRecoveryModel.create(PasswordRecoveryMapper.toPersistence(recovery), { overwrite: true });
  }
}
