import { ApiProperty } from '@nestjs/swagger'
import { IsEmail } from 'class-validator'

export class ForgotPasswordDto {
  @ApiProperty({ format: 'email' })
  @IsEmail(undefined, { message: ({ value }) => value === undefined || value === null || value === '' ? 'El correo electrónico es obligatorio.' : 'Introduce un correo electrónico válido, por ejemplo: nombre@dominio.com.' })
  email!: string
}
