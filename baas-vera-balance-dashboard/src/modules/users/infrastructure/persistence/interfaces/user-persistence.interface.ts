import type { UserRole } from '../../../domain/entities/user.entity';
export interface UserPersistence {
  pk: string;
  sk: 'USER';
  name: string;
  email: string;
  password: string;
  professional_license: string;
  clinic: { pk: string; sk: 'CLINIC' };
  role: UserRole;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
