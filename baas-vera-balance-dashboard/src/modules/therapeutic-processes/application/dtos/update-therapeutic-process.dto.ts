import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsArray, ArrayMinSize, ArrayUnique, IsBoolean, IsIn, ValidateIf } from 'class-validator'
import { THERAPEUTIC_PROCESS_STATUS } from '../../domain/constants/therapeutic-process-status.constant'

export class UpdateTherapeuticProcessDto {
  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «therapy_type» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «therapy_type» es obligatorio.' })
  therapy_type?: string

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «therapist» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «therapist» es obligatorio.' })
  therapist?: string

  @ApiPropertyOptional({ type: [String], minItems: 1, uniqueItems: true })
  @ValidateIf((_, value) => value !== undefined)
  @IsArray({ message: 'El campo «patients» debe ser una lista de identificadores.' })
  @ArrayMinSize(1, { message: 'Selecciona al menos un paciente.' })
  @ArrayUnique({ message: 'No puedes repetir pacientes en el proceso.' })
  @IsString({ each: true, message: 'Cada paciente debe identificarse mediante un texto.' })
  @IsNotEmpty({ each: true, message: 'Los identificadores de pacientes no pueden estar vacíos.' })
  patients?: string[]

  @ApiPropertyOptional({ type: Boolean })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean({ message: 'El campo «is_first_time» es obligatorio y debe ser true o false.' })
  is_first_time?: boolean

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «consultation_reason» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «consultation_reason» es obligatorio.' })
  consultation_reason?: string

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El campo «goals» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «goals» es obligatorio.' })
  goals?: string

}
