import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, IsUUID, Matches, ValidateIf } from 'class-validator';
import type { UserRole, UserStatus } from '../../domain/entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(/\S/)
  name?: string;

  @ApiProperty({ required: false, format: 'email' })
  @ValidateIf((_object, value) => value !== undefined)
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(/\S/)
  professional_license?: string;

  @ApiProperty({ required: false, type: String, format: 'uuid' })
  @ValidateIf((_object, value) => value !== undefined)
  @IsUUID()
  clinic_id?: string;

  @ApiProperty({ required: false, enum: ['clinic', 'therapist'] })
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['clinic', 'therapist'])
  role?: UserRole;

  @ApiProperty({ required: false, enum: ['active', 'inactive'] })
  @ValidateIf((_object, value) => value !== undefined)
  @IsIn(['active', 'inactive'])
  status?: UserStatus;
}
