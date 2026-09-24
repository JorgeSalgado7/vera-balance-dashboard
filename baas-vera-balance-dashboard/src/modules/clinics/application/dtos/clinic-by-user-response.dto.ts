import { ApiProperty } from '@nestjs/swagger';
import { ClinicResponseDto } from './clinic-response.dto';
import type { ClinicStatus } from '../../domain/entities/clinic.entity';

export class ClinicByUserResponseDto extends ClinicResponseDto {
  @ApiProperty({ enum: ['active', 'inactive'] })
  status!: ClinicStatus;

  @ApiProperty({ format: 'date-time' })
  created_at!: string;

  @ApiProperty({ format: 'date-time' })
  updated_at!: string;
}
