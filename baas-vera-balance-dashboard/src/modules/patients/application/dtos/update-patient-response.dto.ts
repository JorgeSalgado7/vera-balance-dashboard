import { ApiProperty } from '@nestjs/swagger'
import { GENDER, EDUCATIONAL_LEVEL, MARITAL_STATUS } from '../../domain/constants/patient-catalogs.constant'

export class UpdatePatientResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty()
  clinic!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ format: 'date' })
  birthday!: string

  @ApiProperty({ type: 'object', nullable: true, required: ['name', 'phone_number', 'relationship'], properties: { name: { type: 'string' }, phone_number: { type: 'string' }, relationship: { type: 'string' } } })
  guardian!: { name: string, phone_number: string, relationship: string } | null

  @ApiProperty({ type: String, nullable: true })
  phone_number!: string | null

  @ApiProperty({ enum: GENDER })
  gender!: typeof GENDER[number]

  @ApiProperty({ enum: EDUCATIONAL_LEVEL })
  educational_level!: typeof EDUCATIONAL_LEVEL[number]

  @ApiProperty()
  occupation!: string

  @ApiProperty({ enum: MARITAL_STATUS })
  marital_status!: typeof MARITAL_STATUS[number]

  @ApiProperty({ type: 'object', nullable: true, required: ['name', 'relationship_time', 'occupation'], properties: { name: { type: 'string' }, relationship_time: { type: 'string' }, occupation: { type: 'string' } } })
  partner_data!: { name: string, relationship_time: string, occupation: string } | null

  @ApiProperty()
  religion!: string

  @ApiProperty()
  address!: string

  @ApiProperty({ format: 'date-time' })
  created_at!: string

  @ApiProperty({ format: 'date-time' })
  updated_at!: string

}
