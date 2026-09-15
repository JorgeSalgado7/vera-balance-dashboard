import type { ClinicEntity } from '../entities/clinic.entity';

export interface IFindClinicsRepository {
  findAll(): Promise<ClinicEntity[]>;
}