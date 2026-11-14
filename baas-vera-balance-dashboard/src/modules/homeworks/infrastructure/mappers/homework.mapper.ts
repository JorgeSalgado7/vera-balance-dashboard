import { HomeworkEntity } from '../../domain/entities/homework.entity'
import type { HomeworkItem } from '../persistance/models/homework.model'

export class HomeworkMapper {
  static toEntity(item: HomeworkItem): HomeworkEntity {
    return Object.assign(new HomeworkEntity(), {
      pk: item.pk,
      sk: item.sk,
      gsi1pk: item.gsi1pk,
      gsi1sk: item.gsi1sk,
      gsi2pk: item.gsi2pk,
      gsi2sk: item.gsi2sk,
      description: item.description,
      record: item.record,
      therapeutic_process: item.therapeutic_process,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })
  }

  static toPersistence(entity: HomeworkEntity) {
    return {
      pk: entity.pk,
      sk: entity.sk,
      gsi1pk: entity.gsi1pk,
      gsi1sk: entity.gsi1sk,
      gsi2pk: entity.gsi2pk,
      gsi2sk: entity.gsi2sk,
      description: entity.description,
      record: entity.record,
      therapeutic_process: entity.therapeutic_process,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    }
  }
}
