import type { ClinicTherapy } from './clinic-therapy.entity'

export interface Clinic {
  id: string
  name: string
  logo: string | null
  address: string
  phoneNumber: string
  therapyTypes: ClinicTherapy[]
  status: 'Activo' | 'Inactivo'
  createdAt: string
  updatedAt: string
}
