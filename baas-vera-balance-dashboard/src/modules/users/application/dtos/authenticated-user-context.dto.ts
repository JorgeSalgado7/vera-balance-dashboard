// Populated by Auth's session guard after checking the current user and clinic.
export interface AuthenticatedUserContext {
  id: string;
  clinicId: string;
  role: 'clinic' | 'therapist';
  status: 'active' | 'inactive';
}
