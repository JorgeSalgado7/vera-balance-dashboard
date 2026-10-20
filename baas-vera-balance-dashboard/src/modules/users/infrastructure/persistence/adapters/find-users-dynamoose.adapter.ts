import { Injectable } from '@nestjs/common';
import type { IFindUsersRepository } from '../../../domain/repositories/find-users.repository';
import type { UserPersistence } from '../interfaces/user-persistence.interface';
import { UserModel } from '../models/user.model';
import { UserMapper } from '../../mappers/user.mapper';

@Injectable()
export class FindUsersDynamooseAdapter implements IFindUsersRepository {
  async findByClinicId(clinicId: string) {
    try {
      const items = await UserModel.scan('sk').eq('USER')
        .and().where('clinic.pk').eq(clinicId).consistent().all().exec();
      return items.map(item => UserMapper.toEntity(item as unknown as UserPersistence));
    } catch {
      throw new Error('Unable to read clinic users.');
    }
  }
}
