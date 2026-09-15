import type { ClinicEntity } from '../entities/clinic.entity';

export interface IUpdateClinicRepository {
  update(entity: ClinicEntity): Promise<ClinicEntity>;
}