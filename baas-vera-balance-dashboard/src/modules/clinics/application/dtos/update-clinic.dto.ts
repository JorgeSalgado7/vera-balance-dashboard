import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsArray, ArrayUnique, IsIn, ValidateIf } from 'class-validator'

export class UpdateClinicDto {
  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «nombre» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «nombre» es obligatorio y no puede estar vacío.' })
  name?: string

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «dirección» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «dirección» es obligatorio y no puede estar vacío.' })
  address?: string

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «teléfono» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «teléfono» es obligatorio y no puede estar vacío.' })
  phone_number?: string

  @ApiPropertyOptional({ type: String, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString({ message: 'El logo debe ser un texto o null.' })
  logo?: string | null

  @ApiPropertyOptional({ type: [String], uniqueItems: true })
  @ValidateIf((_, value) => value !== undefined)
  @IsArray({ message: 'El campo «tipos de terapia» es obligatorio y debe ser una lista.' })
  @ArrayUnique({ message: 'No puedes repetir tipos de terapia en la lista.' })
  @IsString({ each: true, message: 'Cada tipo de terapia debe identificarse mediante un texto.' })
  therapy_types?: string[]

  @ApiPropertyOptional({ enum: ['Activo', 'Inactivo'] })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(['Activo', 'Inactivo'], { message: 'El estado de la clínica debe ser Activo o Inactivo.' })
  status?: 'Activo' | 'Inactivo'
}
