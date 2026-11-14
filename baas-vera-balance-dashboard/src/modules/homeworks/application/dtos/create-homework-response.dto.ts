import { ApiProperty } from '@nestjs/swagger'

export class CreateHomeworkResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty()
  description!: string

  @ApiProperty()
  record!: string

  @ApiProperty({ description: 'ID del proceso terapéutico de la sesión asociada.', readOnly: true })
  therapeutic_process!: string

  @ApiProperty({ format: 'date-time' })
  created_at!: string

  @ApiProperty({ format: 'date-time' })
  updated_at!: string

}
