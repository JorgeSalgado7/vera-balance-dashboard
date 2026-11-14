import { RecordEntity } from '../../domain/entities/record.entity'
import type { RecordItem } from '../persistance/models/record.model'

export class RecordMapper {
  static toEntity(item: RecordItem): RecordEntity {
    return Object.assign(new RecordEntity(), {
      pk: item.pk,
      sk: item.sk,
      gsi1pk: item.gsi1pk,
      gsi1sk: item.gsi1sk,
      gsi2pk: item.gsi2pk,
      gsi2sk: item.gsi2sk,
      session_date: item.session_date,
      attendance: item.attendance,
      resume: item.resume,
      tools: item.tools,
      therapeutic_process: item.therapeutic_process,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })
  }

  static toPersistence(entity: RecordEntity) {
    return {
      pk: entity.pk,
      sk: entity.sk,
      gsi1pk: entity.gsi1pk,
      gsi1sk: entity.gsi1sk,
      gsi2pk: entity.gsi2pk,
      gsi2sk: entity.gsi2sk,
      session_date: entity.session_date,
      attendance: entity.attendance,
      resume: entity.resume,
      tools: entity.tools,
      therapeutic_process: entity.therapeutic_process,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    }
  }
}
