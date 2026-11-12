import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class ChangeUserPasswordDto {
  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «contraseña actual» es obligatorio.' : 'El campo «contraseña actual» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «contraseña actual» es obligatorio y no puede estar vacío.' })
  current_password!: string

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «contraseña» es obligatorio.' : 'El campo «contraseña» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «contraseña» es obligatorio y no puede estar vacío.' })
  password!: string

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString({ message: ({ value }) => value === undefined || value === null ? 'El campo «confirmación de contraseña» es obligatorio.' : 'El campo «confirmación de contraseña» debe ser un texto.' })
  @IsNotEmpty({ message: 'El campo «confirmación de contraseña» es obligatorio y no puede estar vacío.' })
  password_confirmation!: string
}
