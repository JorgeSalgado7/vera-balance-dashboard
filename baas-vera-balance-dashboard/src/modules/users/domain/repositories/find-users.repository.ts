import type { UserEntity } from '../entities/user.entity';

export interface IFindUsersRepository {
  findByClinicId(clinicId: string): Promise<UserEntity[]>;
}
