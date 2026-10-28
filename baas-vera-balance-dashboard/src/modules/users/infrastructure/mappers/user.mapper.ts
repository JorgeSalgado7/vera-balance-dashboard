import { UserEntity } from '../../domain/entities/user.entity'

export class UserMapper {
  static toEntity(item: any): UserEntity {
    const entity = new UserEntity()

    entity.pk = item.pk
    entity.sk = 'USER'

    entity.name = item.name
    entity.email = item.email
    entity.password = item.password
    entity.professional_license = item.professional_license

    entity.role = item.role
    entity.status = item.status
    entity.clinic = item.clinic ?? null

    entity.gsi1pk = item.gsi1pk
    entity.gsi1sk = item.gsi1sk

    entity.gsi2pk = item.gsi2pk
    entity.gsi2sk = item.gsi2sk

    entity.created_at = item.created_at
    entity.updated_at = item.updated_at

    return entity
  }

  static toPersistence(entity: UserEntity): Record<string, unknown> {
    const data: Record<string, unknown> = {
      pk: entity.pk,
      sk: entity.sk,

      gsi2pk: entity.gsi2pk,
      gsi2sk: entity.gsi2sk,

      name: entity.name,
      email: entity.email,
      password: entity.password,
      professional_license: entity.professional_license,

      role: entity.role,
      status: entity.status,

      created_at: entity.created_at,
      updated_at: entity.updated_at,
    }

    if (entity.clinic !== null) {
      data.clinic = entity.clinic
      data.gsi1pk = entity.gsi1pk
      data.gsi1sk = entity.gsi1sk
    }

    return data
  }
}
