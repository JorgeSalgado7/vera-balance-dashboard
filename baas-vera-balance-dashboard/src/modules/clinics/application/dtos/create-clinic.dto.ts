import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsArray, ArrayUnique, IsIn, ValidateIf } from 'class-validator'

export class CreateClinicDto {
  @ApiProperty()
  @IsString({ message: 'El campo «nombre» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «nombre» es obligatorio y no puede estar vacío.' })
  name!: string

  @ApiProperty()
  @IsString({ message: 'El campo «dirección» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «dirección» es obligatorio y no puede estar vacío.' })
  address!: string

  @ApiProperty()
  @IsString({ message: 'El campo «teléfono» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «teléfono» es obligatorio y no puede estar vacío.' })
  phone_number!: string

  @ApiPropertyOptional({ type: String, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString({ message: 'El logo debe ser un texto o null.' })
  logo?: string | null

  @ApiProperty({ type: [String], uniqueItems: true })
  @IsArray({ message: 'El campo «tipos de terapia» es obligatorio y debe ser una lista.' })
  @ArrayUnique({ message: 'No puedes repetir tipos de terapia en la lista.' })
  @IsString({ each: true, message: 'Cada tipo de terapia debe identificarse mediante un texto.' })
  therapy_types!: string[]

  @ApiProperty({ enum: ['Activo', 'Inactivo'] })
  @IsIn(['Activo', 'Inactivo'], { message: 'El estado de la clínica debe ser Activo o Inactivo.' })
  status!: 'Activo' | 'Inactivo'
}
