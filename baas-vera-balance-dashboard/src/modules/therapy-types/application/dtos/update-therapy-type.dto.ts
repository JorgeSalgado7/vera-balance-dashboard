import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, ValidateIf } from 'class-validator'

export class UpdateTherapyTypeDto {
  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «nombre» es obligatorio.' : 'El campo «nombre» debe ser un texto.' })
  name?: string

  @ApiPropertyOptional({ type: String, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «icono» es obligatorio.' : 'El campo «icono» debe ser un texto.' })
  icon?: string | null
}
