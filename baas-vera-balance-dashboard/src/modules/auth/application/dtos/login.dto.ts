import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class LoginDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @ApiProperty({ format: 'email' })
  email!: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ format: 'password', writeOnly: true })
  password!: string
}
