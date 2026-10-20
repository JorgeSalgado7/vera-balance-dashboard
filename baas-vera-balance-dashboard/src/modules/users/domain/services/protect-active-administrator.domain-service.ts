import { Injectable } from '@nestjs/common';
import type { UserEntity } from '../entities/user.entity';
import { LastActiveAdministratorError } from '../errors/user.error';

@Injectable()
export class ProtectActiveAdministratorDomainService {
  execute(current: UserEntity, next: UserEntity | null, users: UserEntity[]): UserEntity | undefined {
    const removesAdministrator = current.role === 'clinic' && current.status === 'active'
      && (!next || next.role !== 'clinic' || next.status !== 'active');
    if (!removesAdministrator) return undefined;
    const witness = users.find(user => user.id !== current.id && user.clinicId === current.clinicId
      && user.role === 'clinic' && user.status === 'active');
    if (!witness) throw new LastActiveAdministratorError();
    return witness;
  }
}
