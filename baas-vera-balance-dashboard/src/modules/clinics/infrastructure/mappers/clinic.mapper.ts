import { ClinicEntity } from '../../domain/entities/clinic.entity'
import type { ClinicItem } from '../persistance/models/clinic.model'

export class ClinicMapper {
  static toEntity(item: ClinicItem): ClinicEntity {
    return Object.assign(new ClinicEntity(), {
      pk: item.pk, name: item.name, logo: item.logo ?? null, address: item.address, phone_number: item.phone_number,
      therapy_types: [...item.therapy_types], status: item.status, gsi1sk: `CLINIC#${item.pk}`,
      created_at: item.created_at, updated_at: item.updated_at,
    })
  }

  static toPersistence(entity: ClinicEntity) {
    return {
      pk: entity.pk, sk: entity.sk, name: entity.name, logo: entity.logo, address: entity.address,
      phone_number: entity.phone_number, therapy_types: [...entity.therapy_types], status: entity.status,
      gsi1pk: entity.gsi1pk, gsi1sk: entity.gsi1sk, created_at: entity.created_at, updated_at: entity.updated_at,
    }
  }
}
