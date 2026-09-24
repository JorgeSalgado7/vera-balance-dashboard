import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { UserStatus } from '../../domain/entities/user.entity';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['active', 'inactive'] })
  @IsIn(['active', 'inactive'])
  status!: UserStatus;
}
