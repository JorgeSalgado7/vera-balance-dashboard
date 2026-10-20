export class UserEntity {
  id!: string;
  name!: string;
  email!: string;
  passwordHash!: string;
  professionalLicense!: string;
  clinicId!: string;
  role!: 'clinic' | 'therapist';
  status!: 'active' | 'inactive';
  createdAt!: string;
  updatedAt!: string;
}
