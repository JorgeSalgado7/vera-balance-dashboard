import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ format: 'email' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  email!: string;

  @ApiProperty({ format: 'password' })
  @IsString()
  @Matches(/\S/)
  password!: string;
}
