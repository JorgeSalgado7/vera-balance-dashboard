import { TherapyTypeEntity } from '../entities/therapy-type.entity'

export class CreateTherapyTypeDomainService {
  create(data: {
    id: string
    name: string
    icon: string | null
    created_at: string
    updated_at: string
  }): TherapyTypeEntity {
    const entity = new TherapyTypeEntity()

    entity.pk = data.id
    entity.sk = 'THERAPY_TYPE'

    entity.name = data.name.trim()
    entity.icon = data.icon

    entity.gsi1pk = 'THERAPY_TYPE'
    entity.gsi1sk = `THERAPY_TYPE#${data.id}`

    entity.created_at = data.created_at
    entity.updated_at = data.updated_at

    return entity
  }
}
