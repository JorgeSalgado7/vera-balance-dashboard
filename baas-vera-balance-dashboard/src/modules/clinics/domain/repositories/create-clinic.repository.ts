import type { ClinicEntity } from '../entities/clinic.entity';

export interface ICreateClinicRepository {
  create(entity: ClinicEntity): Promise<ClinicEntity>;
}