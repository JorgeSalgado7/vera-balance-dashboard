export class ClinicEntity {
  pk!: string
  sk: 'CLINIC' = 'CLINIC'
  name!: string
  address!: string
  phone_number!: string
  therapy_types!: string[]
  status!: 'Activo' | 'Inactivo'
  gsi1pk: 'CLINIC' = 'CLINIC'
  gsi1sk!: string
  created_at!: string
  updated_at!: string
}
