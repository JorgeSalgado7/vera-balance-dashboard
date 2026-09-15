import { ClinicEntity } from '../../domain/entities/clinic.entity';
import type { ClinicPersistence } from '../persistence/interfaces/clinic-persistence.interface';

export class ClinicMapper {
  static toEntity(item: ClinicPersistence): ClinicEntity {
    const entity = new ClinicEntity();

    entity.id = item.pk;
    entity.name = item.name;
    entity.logo = item.logo ?? null;
    entity.address = item.address;
    entity.phoneNumber = item.phone_number;
    entity.therapyTypes = item.therapy_types;
    entity.status = item.status;
    entity.createdAt = item.created_at;
    entity.updatedAt = item.updated_at;

    return entity;
  }

  static toPersistence(entity: ClinicEntity): ClinicPersistence {
    return {
      pk: entity.id,
      sk: 'CLINIC',
      name: entity.name,
      logo: entity.logo,
      address: entity.address,
      phone_number: entity.phoneNumber,
      therapy_types: entity.therapyTypes,
      status: entity.status,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt
    };
  }
}