export interface UpdateClinicDto {
  name?: string
  logo?: string | null
  address?: string
  phone_number?: string
  therapy_types?: string[]
  status?: 'Activo' | 'Inactivo'
}
