import { ApiProperty } from '@nestjs/swagger'
import { THERAPEUTIC_PROCESS_STATUS } from '../../domain/constants/therapeutic-process-status.constant'

export class GetTherapeuticProcessByIdResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty()
  clinic!: string

  @ApiProperty({ type: 'object', required: ['id', 'name', 'icon'], properties: { id: { type: 'string' }, name: { type: 'string' }, icon: { type: 'string', nullable: true } } })
  therapy_type!: { id: string, name: string, icon: string | null }

  @ApiProperty({ type: 'object', required: ['id', 'name', 'professional_license'], properties: { id: { type: 'string' }, name: { type: 'string' }, professional_license: { type: 'string' } } })
  therapist!: { id: string, name: string, professional_license: string }

  @ApiProperty({ type: 'array', items: { type: 'object', required: ['id', 'name'], properties: { id: { type: 'string' }, name: { type: 'string' } } } })
  patients!: { id: string, name: string }[]

  @ApiProperty({ type: Boolean })
  is_first_time!: boolean

  @ApiProperty()
  consultation_reason!: string

  @ApiProperty()
  goals!: string

  @ApiProperty({ enum: THERAPEUTIC_PROCESS_STATUS })
  status!: typeof THERAPEUTIC_PROCESS_STATUS[number]

  @ApiProperty({ format: 'date-time' })
  created_at!: string

  @ApiProperty({ format: 'date-time' })
  updated_at!: string

}
