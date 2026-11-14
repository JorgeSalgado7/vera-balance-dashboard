import { ApiProperty } from '@nestjs/swagger'
import { RECORD_ATTENDANCE } from '../../domain/constants/record-attendance.constant'

export class CreateRecordResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty({ format: 'date-time' })
  session_date!: string

  @ApiProperty({ enum: RECORD_ATTENDANCE })
  attendance!: typeof RECORD_ATTENDANCE[number]

  @ApiProperty({ type: String, nullable: true })
  resume!: string | null

  @ApiProperty({ type: String, nullable: true })
  tools!: string | null

  @ApiProperty()
  therapeutic_process!: string

  @ApiProperty({ format: 'date-time' })
  created_at!: string

  @ApiProperty({ format: 'date-time' })
  updated_at!: string

}
