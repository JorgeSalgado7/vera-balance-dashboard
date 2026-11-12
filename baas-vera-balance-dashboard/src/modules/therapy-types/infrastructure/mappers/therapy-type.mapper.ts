import { TherapyTypeEntity } from '../../domain/entities/therapy-type.entity'

import type { TherapyTypeItem } from '../persistance/models/therapy-type.model'

export class TherapyTypeMapper {
  static toEntity(item: TherapyTypeItem): TherapyTypeEntity {
    return Object.assign(new TherapyTypeEntity(), {
      pk: item.pk, name: item.name, icon: item.icon ?? null,
      gsi1sk: `THERAPY_TYPE#${item.pk}`, created_at: item.created_at, updated_at: item.updated_at,
    })
  }

  static toPersistence(entity: TherapyTypeEntity) {
    return { pk: entity.pk, sk: entity.sk, name: entity.name, icon: entity.icon,
      gsi1pk: entity.gsi1pk, gsi1sk: entity.gsi1sk,
      created_at: entity.created_at, updated_at: entity.updated_at }
  }
}
