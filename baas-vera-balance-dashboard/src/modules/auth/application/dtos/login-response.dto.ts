import { ApiProperty } from '@nestjs/swagger'
import { USER_ROLE_VALUES } from '../../../../constants/user-roles.constant'
import type { UserRole } from '../../../../constants/user-roles.constant'

export class LoginResponseDto {
  @ApiProperty()
  access_token!: string

  @ApiProperty()
  refresh_token!: string

  @ApiProperty({
    required: true,
    allOf: [{
      type: 'object',
      required: ['id', 'name', 'email', 'role', 'clinic'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: USER_ROLE_VALUES },
        clinic: { type: 'string', nullable: true },
      },
    }],
  })
  user!: {
    id: string
    name: string
    email: string
    role: UserRole
    clinic: string | null
  }
}
