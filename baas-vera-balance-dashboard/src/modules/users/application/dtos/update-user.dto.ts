import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator'
import { USER_ROLE_VALUES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'

export class UpdateUserDto {
  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «nombre» es obligatorio.' : 'El campo «nombre» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «nombre» es obligatorio y no puede estar vacío.' })
  name?: string

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «cédula profesional» es obligatorio.' : 'El campo «cédula profesional» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «cédula profesional» es obligatorio y no puede estar vacío.' })
  professional_license?: string

  @ApiPropertyOptional({ enum: USER_ROLE_VALUES })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(USER_ROLE_VALUES, { message: 'Selecciona un valor válido para el campo «rol».' })
  role?: UserRole

  @ApiPropertyOptional({ type: String, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsUUID(undefined, { message: 'El campo «clínica» debe contener un identificador válido.' })
  clinic?: string | null
}
