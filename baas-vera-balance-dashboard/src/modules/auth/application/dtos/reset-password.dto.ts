import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({ format: 'email' })
  @IsEmail()
  email!: string

  @ApiProperty({ pattern: '^[0-9]{6}$', minLength: 6, maxLength: 6 })
  @IsString()
  @Matches(/^[0-9]{6}$/)
  code!: string

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  password!: string

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  password_confirmation!: string
}
