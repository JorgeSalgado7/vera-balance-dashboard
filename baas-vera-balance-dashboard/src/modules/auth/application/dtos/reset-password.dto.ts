import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({ format: 'email' })
  @IsEmail(undefined, { message: ({ value }) => value === undefined || value === null || value === '' ? 'El correo electrónico es obligatorio.' : 'Introduce un correo electrónico válido, por ejemplo: nombre@dominio.com.' })
  email!: string

  @ApiProperty({ pattern: '^[0-9]{6}$', minLength: 6, maxLength: 6 })
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «código de recuperación» es obligatorio.' : 'El campo «código de recuperación» debe ser un texto.' })
  @Matches(/^[0-9]{6}$/, { message: 'El código de recuperación debe contener exactamente 6 dígitos.' })
  code!: string

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «contraseña» es obligatorio.' : 'El campo «contraseña» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «contraseña» es obligatorio y no puede estar vacío.' })
  password!: string

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «confirmación de contraseña» es obligatorio.' : 'El campo «confirmación de contraseña» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «confirmación de contraseña» es obligatorio y no puede estar vacío.' })
  password_confirmation!: string
}
