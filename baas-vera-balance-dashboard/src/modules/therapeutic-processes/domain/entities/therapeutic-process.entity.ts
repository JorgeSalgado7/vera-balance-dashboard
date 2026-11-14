import { THERAPEUTIC_PROCESS_STATUS } from '../constants/therapeutic-process-status.constant'

export class TherapeuticProcessEntity {
  pk!: string
  sk: 'THERAPEUTIC_PROCESS' = 'THERAPEUTIC_PROCESS'
  gsi1pk: 'THERAPEUTIC_PROCESS' = 'THERAPEUTIC_PROCESS'
  gsi1sk!: string
  gsi2pk!: string
  gsi2sk!: string
  gsi3pk!: string
  gsi3sk!: string
  clinic!: string
  therapy_type!: string
  therapist!: string
  patients!: string[]
  is_first_time!: boolean
  consultation_reason!: string
  goals!: string
  status!: typeof THERAPEUTIC_PROCESS_STATUS[number]
  created_at!: string
  updated_at!: string
}
