import { TherapeuticProcessEntity } from '../../domain/entities/therapeutic-process.entity'
import type { TherapeuticProcessItem } from '../persistance/models/therapeutic-process.model'

export class TherapeuticProcessMapper {
  static toEntity(item: TherapeuticProcessItem): TherapeuticProcessEntity {
    return Object.assign(new TherapeuticProcessEntity(), {
      pk: item.pk,
      sk: item.sk,
      gsi1pk: item.gsi1pk,
      gsi1sk: item.gsi1sk,
      gsi2pk: item.gsi2pk,
      gsi2sk: item.gsi2sk,
      gsi3pk: item.gsi3pk,
      gsi3sk: item.gsi3sk,
      clinic: item.clinic,
      therapy_type: item.therapy_type,
      therapist: item.therapist,
      patients: [...item.patients],
      is_first_time: item.is_first_time,
      consultation_reason: item.consultation_reason,
      goals: item.goals,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })
  }

  static toPersistence(entity: TherapeuticProcessEntity) {
    return {
      pk: entity.pk,
      sk: entity.sk,
      gsi1pk: entity.gsi1pk,
      gsi1sk: entity.gsi1sk,
      gsi2pk: entity.gsi2pk,
      gsi2sk: entity.gsi2sk,
      gsi3pk: entity.gsi3pk,
      gsi3sk: entity.gsi3sk,
      clinic: entity.clinic,
      therapy_type: entity.therapy_type,
      therapist: entity.therapist,
      patients: [...entity.patients],
      is_first_time: entity.is_first_time,
      consultation_reason: entity.consultation_reason,
      goals: entity.goals,
      status: entity.status,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    }
  }
}
