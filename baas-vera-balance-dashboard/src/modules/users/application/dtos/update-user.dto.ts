import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator'
import { USER_ROLE_VALUES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'

export class UpdateUserDto {
  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  name?: string

  @ApiPropertyOptional()
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  professional_license?: string

  @ApiPropertyOptional({ enum: USER_ROLE_VALUES })
  @ValidateIf((_, value) => value !== undefined)
  @IsIn(USER_ROLE_VALUES)
  role?: UserRole

  @ApiPropertyOptional({ type: String, nullable: true })
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsUUID()
  clinic?: string | null
}
