import type {
  ClinicStatus,
  TherapyType
} from '../../../domain/entities/clinic.entity';

export interface ClinicPersistence {
  pk: string;
  sk: 'CLINIC';
  name: string;
  logo: string | null;
  address: string;
  phone_number: string;
  therapy_types: TherapyType[];
  status: ClinicStatus;
  created_at: string;
  updated_at: string;
}