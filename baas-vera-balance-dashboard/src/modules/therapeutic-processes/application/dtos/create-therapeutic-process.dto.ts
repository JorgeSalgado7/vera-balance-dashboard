import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsArray, ArrayMinSize, ArrayUnique, IsBoolean, IsIn, ValidateIf } from 'class-validator'
import { THERAPEUTIC_PROCESS_STATUS } from '../../domain/constants/therapeutic-process-status.constant'

export class CreateTherapeuticProcessDto {
  @ApiProperty()
  @IsString({ message: 'El campo «clinic» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «clinic» es obligatorio.' })
  clinic!: string

  @ApiProperty()
  @IsString({ message: 'El campo «therapy_type» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «therapy_type» es obligatorio.' })
  therapy_type!: string

  @ApiProperty()
  @IsString({ message: 'El campo «therapist» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «therapist» es obligatorio.' })
  therapist!: string

  @ApiProperty({ type: [String], minItems: 1, uniqueItems: true })
  @IsArray({ message: 'El campo «patients» debe ser una lista de identificadores.' })
  @ArrayMinSize(1, { message: 'Selecciona al menos un paciente.' })
  @ArrayUnique({ message: 'No puedes repetir pacientes en el proceso.' })
  @IsString({ each: true, message: 'Cada paciente debe identificarse mediante un texto.' })
  @IsNotEmpty({ each: true, message: 'Los identificadores de pacientes no pueden estar vacíos.' })
  patients!: string[]

  @ApiProperty({ type: Boolean })
  @IsBoolean({ message: 'El campo «is_first_time» es obligatorio y debe ser true o false.' })
  is_first_time!: boolean

  @ApiProperty()
  @IsString({ message: 'El campo «consultation_reason» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «consultation_reason» es obligatorio.' })
  consultation_reason!: string

  @ApiProperty()
  @IsString({ message: 'El campo «goals» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «goals» es obligatorio.' })
  goals!: string

  @ApiProperty({ enum: THERAPEUTIC_PROCESS_STATUS })
  @IsIn(THERAPEUTIC_PROCESS_STATUS, { message: 'Selecciona un estado válido para el proceso terapéutico.' })
  status!: typeof THERAPEUTIC_PROCESS_STATUS[number]

}
