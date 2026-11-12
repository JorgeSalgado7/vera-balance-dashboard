import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail(undefined, { message: ({ value }) => value === undefined || value === null || value === '' ? 'El correo electrónico es obligatorio.' : 'Introduce un correo electrónico válido, por ejemplo: nombre@dominio.com.' })
  @ApiProperty({ format: 'email' })
  email!: string

  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «contraseña» es obligatorio.' : 'El campo «contraseña» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «contraseña» es obligatorio y no puede estar vacío.' })
  @ApiProperty({ format: 'password', writeOnly: true })
  password!: string
}
