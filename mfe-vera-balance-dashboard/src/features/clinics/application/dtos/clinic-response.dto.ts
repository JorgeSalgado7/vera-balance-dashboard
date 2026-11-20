import type { ClinicTherapyResponseDto } from './clinic-therapy-response.dto'

export interface ClinicResponseDto {
  id: string
  name: string
  logo: string | null
  address: string
  phone_number: string
  therapy_types: ClinicTherapyResponseDto[]
  status: 'Activo' | 'Inactivo'
  created_at: string
  updated_at: string
}
