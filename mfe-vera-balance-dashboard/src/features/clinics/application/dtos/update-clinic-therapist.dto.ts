export interface UpdateClinicTherapistDto {
  role: 'admin' | 'clinic' | 'therapist'
  name: string
  professional_license: string
}
