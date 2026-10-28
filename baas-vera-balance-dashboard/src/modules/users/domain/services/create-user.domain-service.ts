import type { UserRole } from '../../../../constants/user-roles.constant'
import { UserEntity } from '../entities/user.entity'
import { ValidateCreateUserDomainService } from './validate-create-user.domain-service'

export class CreateUserDomainService {
  constructor(private readonly validateCreate: ValidateCreateUserDomainService) {}

  create(data: {
    id: string
    name: string
    email: string
    password: string
    professional_license: string
    role: UserRole
    status: 'Activo' | 'Inactivo'
    clinic: string | null
    created_at: string
    updated_at: string
  }): UserEntity {
    const entity = new UserEntity()

    entity.pk = data.id
    entity.sk = 'USER'

    entity.name = data.name.trim()
    entity.email = data.email.trim().toLowerCase()
    entity.password = data.password
    entity.professional_license = data.professional_license.trim()

    entity.role = data.role
    entity.status = data.status
    entity.clinic = data.clinic

    if (data.clinic !== null) {
      entity.gsi1pk = `CLINIC#${data.clinic}`
      entity.gsi1sk = `USER#${data.id}`
    }

    entity.gsi2pk = `EMAIL#${entity.email}`
    entity.gsi2sk = `USER#${data.id}`

    entity.created_at = data.created_at
    entity.updated_at = data.updated_at

    this.validateCreate.execute(entity)

    return entity
  }
}
