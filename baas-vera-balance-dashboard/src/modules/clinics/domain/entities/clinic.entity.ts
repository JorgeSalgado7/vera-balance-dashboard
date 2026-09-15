export interface TherapyType {
  name: string;
  icon: string;
}

export type ClinicStatus = 'active' | 'inactive';

export class ClinicEntity {
  id!: string;
  name!: string;
  logo!: string | null;
  address!: string;
  phoneNumber!: string;
  therapyTypes!: TherapyType[];
  status!: ClinicStatus;
  createdAt!: string;
  updatedAt!: string;
}