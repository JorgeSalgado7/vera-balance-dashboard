import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResetPasswordDto } from './reset-password.dto';

export class ForgotPasswordResetDto extends ResetPasswordDto {
  @ApiProperty({ format: 'email' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  email!: string;

  @ApiProperty({ pattern: '^[0-9]{6}$' })
  @IsString()
  @Matches(/^[0-9]{6}$/)
  verification_code!: string;
}
