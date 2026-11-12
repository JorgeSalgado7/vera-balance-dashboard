import type { UserRole } from '../../../../constants/user-roles.constant'
export class UserEntity {
  pk!: string
  sk: 'USER' = 'USER'

  name!: string
  email!: string
  password!: string
  declare password_recovery_code_hash?: string
  declare password_recovery_expires_at?: string
  professional_license!: string

  role!: UserRole
  status!: 'Activo' | 'Inactivo'

  clinic!: string | null

  gsi1pk!: string
  gsi1sk!: string

  gsi2pk?: string
  gsi2sk?: string

  gsi3pk!: string
  gsi3sk!: string

  created_at!: string
  updated_at!: string
}
