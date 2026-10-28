import type { UserRole } from '../../../../constants/user-roles.constant'
export class UserEntity {
  pk!: string
  sk: 'USER' = 'USER'

  name!: string
  email!: string
  password!: string
  professional_license!: string

  role!: UserRole
  status!: 'Activo' | 'Inactivo'

  clinic!: string | null

  gsi1pk?: string
  gsi1sk?: string

  gsi2pk!: string
  gsi2sk!: string

  created_at!: string
  updated_at!: string
}
