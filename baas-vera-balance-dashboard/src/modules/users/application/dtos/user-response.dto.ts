import { ApiProperty } from '@nestjs/swagger';
import type { UserRole } from '../../domain/entities/user.entity';

export class UserClinicReferenceDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;
}
export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;
  @ApiProperty()
  name!: string;
  @ApiProperty({ format: 'email' })
  email!: string;
  @ApiProperty()
  professional_license!: string;
  @ApiProperty({ type: UserClinicReferenceDto })
  clinic!: UserClinicReferenceDto;
  @ApiProperty({ enum: ['clinic', 'therapist'] })
  role!: UserRole;
  @ApiProperty({ enum: ['active', 'inactive'] })
  status!: 'active' | 'inactive';
  @ApiProperty({ format: 'date-time' })
  created_at!: string;
  @ApiProperty({ format: 'date-time' })
  updated_at!: string;
}
