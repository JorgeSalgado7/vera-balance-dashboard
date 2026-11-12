import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class RefreshDto {
  @ApiProperty()
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «token de renovación» es obligatorio.' : 'El campo «token de renovación» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «token de renovación» es obligatorio y no puede estar vacío.' })
  refresh_token!: string
}
