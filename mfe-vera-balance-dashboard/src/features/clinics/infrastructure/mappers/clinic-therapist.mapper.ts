import type { ClinicTherapistResponseDto } from '../../application/dtos/clinic-therapist-response.dto'
import type { ClinicTherapist } from '../../domain/entities/clinic-therapist.entity'

export const mapClinicTherapist = (data: ClinicTherapistResponseDto): ClinicTherapist => ({
  id: data.id,
  name: data.name,
  email: data.email,
  professionalLicense: data.professional_license,
  role: data.role,
  status: data.status,
  clinic: data.clinic,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
})
