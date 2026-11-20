export interface ClinicTherapist {
  id: string
  name: string
  email: string
  professionalLicense: string
  role: 'admin' | 'clinic' | 'therapist'
  status: 'Activo' | 'Inactivo'
  clinic: string | null
  createdAt: string
  updatedAt: string
}
