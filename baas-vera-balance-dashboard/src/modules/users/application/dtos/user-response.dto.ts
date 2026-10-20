import { ApiProperty } from '@nestjs/swagger';
import type { UserEntity } from '../../domain/entities/user.entity';

export class UserClinicReferenceDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;
}

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ format: 'email' }) email!: string;
  @ApiProperty() professional_license!: string;
  @ApiProperty({ type: UserClinicReferenceDto }) clinic!: UserClinicReferenceDto;
  @ApiProperty({ enum: ['clinic', 'therapist'] }) role!: string;
  @ApiProperty({ enum: ['active', 'inactive'] }) status!: string;
  @ApiProperty({ format: 'date-time' }) created_at!: string;
  @ApiProperty({ format: 'date-time' }) updated_at!: string;

  static fromEntity(user: UserEntity): UserResponseDto {
    return {
      id: user.id, name: user.name, email: user.email,
      professional_license: user.professionalLicense, clinic: { id: user.clinicId },
      role: user.role, status: user.status, created_at: user.createdAt, updated_at: user.updatedAt
    };
  }
}
