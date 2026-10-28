import { USER_ROLE_VALUES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty({ format: 'email' })
  email!: string

  @ApiProperty()
  professional_license!: string

  @ApiProperty({ enum: USER_ROLE_VALUES })
  role!: UserRole

  @ApiProperty({ enum: ['Activo', 'Inactivo'] })
  status!: 'Activo' | 'Inactivo'

  @ApiProperty({ type: String, nullable: true })
  clinic!: string | null

  @ApiProperty({ format: 'date-time' })
  created_at!: string

  @ApiProperty({ format: 'date-time' })
  updated_at!: string
}
