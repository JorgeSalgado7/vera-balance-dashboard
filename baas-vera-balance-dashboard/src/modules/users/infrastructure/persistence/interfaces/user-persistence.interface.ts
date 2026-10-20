export interface UserPersistence {
  pk: string;
  sk: 'USER';
  name: string;
  email: string;
  password: string;
  professional_license: string;
  clinic: { pk: string; sk: 'CLINIC' };
  role: 'clinic' | 'therapist';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
