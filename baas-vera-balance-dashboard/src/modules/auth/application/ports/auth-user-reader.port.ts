export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  clinicId: string;
  status: 'active' | 'inactive';
  role: 'clinic' | 'therapist';
}

export interface AuthUserReaderPort {
  findByEmail(email: string): Promise<AuthUser | null>;
  findById(id: string): Promise<AuthUser | null>;
}
