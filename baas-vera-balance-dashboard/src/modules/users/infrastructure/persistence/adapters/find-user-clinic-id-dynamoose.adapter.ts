import { Injectable } from '@nestjs/common';
import type { IFindUserClinicIdRepository } from '../../../domain/repositories/find-user-clinic-id.repository';
import { UserModel } from '../models/user.model';

@Injectable()
export class FindUserClinicIdDynamooseAdapter implements IFindUserClinicIdRepository {
  async findByUserId(id: string): Promise<string | null> {
    const item = await UserModel.get({ pk: id, sk: 'USER' }, { attributes: ['clinic'] });
    const clinic = item?.clinic as { pk?: string } | undefined;
    return typeof clinic?.pk === 'string' && clinic.pk ? clinic.pk : null;
  }
}
