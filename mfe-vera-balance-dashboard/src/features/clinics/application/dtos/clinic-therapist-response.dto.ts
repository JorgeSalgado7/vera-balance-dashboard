export interface ClinicTherapistResponseDto {
  id: string
  name: string
  email: string
  professional_license: string
  role: 'admin' | 'clinic' | 'therapist'
  status: 'Activo' | 'Inactivo'
  clinic: string | null
  created_at: string
  updated_at: string
}
