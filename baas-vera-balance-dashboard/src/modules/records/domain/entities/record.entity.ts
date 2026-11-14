import { RECORD_ATTENDANCE } from '../constants/record-attendance.constant'

export class RecordEntity {
  pk!: string
  sk!: string
  gsi1pk!: string
  gsi1sk!: string
  gsi2pk!: string
  gsi2sk!: string
  session_date!: string
  attendance!: typeof RECORD_ATTENDANCE[number]
  resume!: string | null
  tools!: string | null
  therapeutic_process!: string
  created_at!: string
  updated_at!: string
}
