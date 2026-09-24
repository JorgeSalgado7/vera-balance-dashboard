import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, IsUUID, Matches } from 'class-validator';
import type { UserRole } from '../../domain/entities/user.entity';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @Matches(/\S/)
  name!: string;

  @ApiProperty({ format: 'email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ format: 'password', writeOnly: true })
  @IsString()
  @Matches(/\S/)
  password!: string;

  @ApiProperty()
  @IsString()
  @Matches(/\S/)
  professional_license!: string;

  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  clinic_id!: string;

  @ApiProperty({ enum: ['clinic', 'therapist'] })
  @IsIn(['clinic', 'therapist'])
  role!: UserRole;
}
