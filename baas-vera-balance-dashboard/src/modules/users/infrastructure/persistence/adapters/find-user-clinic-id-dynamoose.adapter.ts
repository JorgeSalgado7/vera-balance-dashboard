import { Injectable } from '@nestjs/common';
import { UserModel } from '../models/user.model';
import type { UserPersistence } from '../interfaces/user-persistence.interface';
import type { IFindUserClinicIdRepository } from '../../../domain/repositories/find-user-clinic-id.repository';

@Injectable()
export class FindUserClinicIdDynamooseAdapter implements IFindUserClinicIdRepository {
  private readonly model = UserModel;

  async findClinicIdByUserId(userId: string): Promise<string | null> {
    const item = await this.model.get(
      { pk: userId, sk: 'USER' },
      { attributes: ['clinic'] }
    );
    const reference = (item as unknown as Pick<UserPersistence, 'clinic'> | undefined)?.clinic;

    return reference?.pk ?? null;
  }
}
