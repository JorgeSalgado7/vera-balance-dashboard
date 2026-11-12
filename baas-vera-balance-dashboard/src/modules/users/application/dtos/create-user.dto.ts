import { USER_ROLE_VALUES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'
import { IsEmail, IsIn, IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «nombre» es obligatorio.' : 'El campo «nombre» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «nombre» es obligatorio y no puede estar vacío.' })
  @ApiProperty()
  name!: string

  @IsEmail(undefined, { message: ({ value }) => value === undefined || value === null || value === '' ? 'El correo electrónico es obligatorio.' : 'Introduce un correo electrónico válido, por ejemplo: nombre@dominio.com.' })
  @ApiProperty({ format: 'email' })
  email!: string

  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «contraseña» es obligatorio.' : 'El campo «contraseña» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «contraseña» es obligatorio y no puede estar vacío.' })
  @ApiProperty({ format: 'password', writeOnly: true })
  password!: string

  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «cédula profesional» es obligatorio.' : 'El campo «cédula profesional» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «cédula profesional» es obligatorio y no puede estar vacío.' })
  @ApiProperty()
  professional_license!: string

  @IsIn(USER_ROLE_VALUES, { message: 'Selecciona un valor válido para el campo «rol».' })
  @ApiProperty({ enum: USER_ROLE_VALUES })
  role!: UserRole

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUUID(undefined, { message: 'El campo «type» debe contener un identificador válido.' })
  @ApiPropertyOptional({
    type: String,
    nullable: true,
  })
  clinic?: string | null
}
