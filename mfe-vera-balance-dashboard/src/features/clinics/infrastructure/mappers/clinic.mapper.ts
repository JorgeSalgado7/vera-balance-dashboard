import type { ClinicResponseDto } from '../../application/dtos/clinic-response.dto'
import type { Clinic } from '../../domain/entities/clinic.entity'
import { mapClinicTherapy } from './clinic-therapy.mapper'

export const mapClinic = (data: ClinicResponseDto): Clinic => ({
  id: data.id,
  name: data.name,
  logo: data.logo,
  address: data.address,
  phoneNumber: data.phone_number,
  therapyTypes: data.therapy_types.map(mapClinicTherapy),
  status: data.status,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
})
