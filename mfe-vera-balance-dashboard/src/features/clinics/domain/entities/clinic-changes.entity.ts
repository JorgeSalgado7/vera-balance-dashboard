export interface ClinicChanges {
  name?: string
  logo?: string | null
  address?: string
  phoneNumber?: string
  therapyTypes?: string[]
  status?: 'Activo' | 'Inactivo'
}
