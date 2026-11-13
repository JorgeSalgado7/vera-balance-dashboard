import { PatientEntity } from '../../domain/entities/patient.entity'
import type { PatientItem } from '../persistance/models/patient.model'

export class PatientMapper {
  static toEntity(item: PatientItem): PatientEntity {
    return Object.assign(new PatientEntity(), {
      pk: item.pk,
      sk: item.sk,
      gsi1pk: item.gsi1pk,
      gsi1sk: item.gsi1sk,
      gsi2pk: item.gsi2pk,
      gsi2sk: item.gsi2sk,
      clinic: item.clinic,
      name: item.name,
      birthday: item.birthday,
      guardian: item.guardian ?? null,
      phone_number: item.phone_number ?? null,
      gender: item.gender,
      educational_level: item.educational_level,
      occupation: item.occupation,
      marital_status: item.marital_status,
      partner_data: item.partner_data ?? null,
      religion: item.religion,
      address: item.address,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })
  }

  static toPersistence(entity: PatientEntity) {
    return {
      pk: entity.pk,
      sk: entity.sk,
      gsi1pk: entity.gsi1pk,
      gsi1sk: entity.gsi1sk,
      gsi2pk: entity.gsi2pk,
      gsi2sk: entity.gsi2sk,
      clinic: entity.clinic,
      name: entity.name,
      birthday: entity.birthday,
      guardian: entity.guardian,
      phone_number: entity.phone_number,
      gender: entity.gender,
      educational_level: entity.educational_level,
      occupation: entity.occupation,
      marital_status: entity.marital_status,
      partner_data: entity.partner_data,
      religion: entity.religion,
      address: entity.address,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    }
  }
}
