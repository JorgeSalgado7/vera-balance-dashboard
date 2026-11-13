import { ApiProperty } from '@nestjs/swagger'

export class GetClinicsResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ type: String, nullable: true })
  logo!: string | null

  @ApiProperty()
  address!: string

  @ApiProperty()
  phone_number!: string

  @ApiProperty({ type: 'array', items: {
    type: 'object', required: ['id', 'name', 'icon'], properties: {
      id: { type: 'string' }, name: { type: 'string' }, icon: { type: 'string', nullable: true },
    },
  } })
  therapy_types!: Array<{ id: string, name: string, icon: string | null }>

  @ApiProperty({ enum: ['Activo', 'Inactivo'] })
  status!: 'Activo' | 'Inactivo'

  @ApiProperty({ format: 'date-time' })
  created_at!: string

  @ApiProperty({ format: 'date-time' })
  updated_at!: string
}
