export type UserRole = 'clinic' | 'therapist';
export type UserStatus = 'active' | 'inactive';

export class UserEntity {
  id!: string;
  name!: string;
  email!: string;
  passwordHash!: string;
  professionalLicense!: string;
  clinicId!: string;
  role!: UserRole;
  status!: UserStatus;
  createdAt!: string;
  updatedAt!: string;
}
