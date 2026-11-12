import { ApiProperty } from '@nestjs/swagger'

export class CreateTherapyTypeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ type: String, nullable: true })
  icon!: string | null

  @ApiProperty({ format: 'date-time' })
  created_at!: string

  @ApiProperty({ format: 'date-time' })
  updated_at!: string
}
