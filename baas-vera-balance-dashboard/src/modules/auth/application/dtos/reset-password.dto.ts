import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ format: 'password' })
  @IsString()
  @Matches(/\S/)
  password!: string;

  @ApiProperty({ format: 'password' })
  @IsString()
  @Matches(/\S/)
  password_confirmation!: string;
}
