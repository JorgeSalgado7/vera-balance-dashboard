import type { ClinicEntity } from '../entities/clinic.entity';

export interface IFindClinicByIdRepository {
  findById(clinicId: string): Promise<ClinicEntity | null>;
}