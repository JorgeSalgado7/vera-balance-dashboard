import { GENDER, EDUCATIONAL_LEVEL, MARITAL_STATUS } from '../constants/patient-catalogs.constant'

export class PatientEntity {
  pk!: string
  sk: 'PATIENT' = 'PATIENT'
  gsi1pk: 'PATIENT' = 'PATIENT'
  gsi1sk!: string
  gsi2pk!: string
  gsi2sk!: string
  clinic!: string
  name!: string
  birthday!: string
  guardian!: { name: string, phone_number: string, relationship: string } | null
  phone_number!: string | null
  gender!: typeof GENDER[number]
  educational_level!: typeof EDUCATIONAL_LEVEL[number]
  occupation!: string
  marital_status!: typeof MARITAL_STATUS[number]
  partner_data!: { name: string, relationship_time: string, occupation: string } | null
  religion!: string
  address!: string
  created_at!: string
  updated_at!: string
}
