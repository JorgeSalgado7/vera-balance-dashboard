import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsIn, IsISO8601, Matches, ValidateIf } from 'class-validator'
import { RECORD_ATTENDANCE } from '../../domain/constants/record-attendance.constant'

export class UpdateRecordDto {
  @ApiPropertyOptional({ format: 'date-time' })
  @ValidateIf((_, value) => value !== undefined)
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/, { message: 'El campo «session_date» debe incluir fecha, hora y zona horaria.' })
  @IsISO8601({ strict: true, strictSeparator: true }, { message: 'El campo «session_date» debe ser una fecha ISO válida con hora y zona horaria.' })
  @IsString({ message: 'El campo «session_date» debe ser un texto de fecha ISO.' })
  session_date?: string

  @ApiPropertyOptional({ enum: RECORD_ATTENDANCE })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(RECORD_ATTENDANCE, { message: 'Selecciona una asistencia válida: Asistida, Cancelada, Con retraso o Falta.' })
  attendance?: typeof RECORD_ATTENDANCE[number]

  @ApiPropertyOptional({ type: String, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString({ message: 'El campo «resume» debe ser un texto.' })
  resume?: string | null

  @ApiPropertyOptional({ type: String, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsString({ message: 'El campo «tools» debe ser un texto.' })
  tools?: string | null

}
