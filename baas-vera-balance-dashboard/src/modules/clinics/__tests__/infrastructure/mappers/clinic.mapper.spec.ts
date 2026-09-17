import { ClinicMapper } from '../../../infrastructure/mappers/clinic.mapper';
import type { ClinicEntity } from '../../../domain/entities/clinic.entity';
import type { ClinicPersistence } from '../../../infrastructure/persistence/interfaces/clinic-persistence.interface';

describe('ClinicMapper', () => {
  it('should map persistence to domain entity', () => {
    const persistence: ClinicPersistence = {
      pk: 'clinic-id',
      sk: 'CLINIC',
      name: 'Vera Balance',
      logo: null,
      address: 'Test address',
      phone_number: '5512345678',
      therapy_types: [
        {
          name: 'Terapia individual',
          icon: ''
        }
      ],
      status: 'active',
      created_at: '2026-09-14T00:00:00.000Z',
      updated_at: '2026-09-14T00:00:00.000Z'
    };

    const result = ClinicMapper.toEntity(persistence);

    expect(result).toEqual({
      id: persistence.pk,
      name: persistence.name,
      logo: persistence.logo,
      address: persistence.address,
      phoneNumber: persistence.phone_number,
      therapyTypes: persistence.therapy_types,
      status: persistence.status,
      createdAt: persistence.created_at,
      updatedAt: persistence.updated_at
    });
  });

  it('should map domain entity to persistence', () => {
    const entity = {
      id: 'clinic-id',
      name: 'Vera Balance',
      logo: null,
      address: 'Test address',
      phoneNumber: '5512345678',
      therapyTypes: [
        {
          name: 'Terapia individual',
          icon: ''
        }
      ],
      status: 'active',
      createdAt: '2026-09-14T00:00:00.000Z',
      updatedAt: '2026-09-14T00:00:00.000Z'
    } as ClinicEntity;

    const result = ClinicMapper.toPersistence(entity);

    expect(result).toEqual({
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
    });
  });

  it('should preserve null logo when mapping persistence to entity', () => {
    const persistence: ClinicPersistence = {
      pk: 'clinic-id',
      sk: 'CLINIC',
      name: 'Vera Balance',
      logo: null,
      address: 'Test address',
      phone_number: '5512345678',
      therapy_types: [],
      status: 'active',
      created_at: '2026-09-14T00:00:00.000Z',
      updated_at: '2026-09-14T00:00:00.000Z'
    };

    const result = ClinicMapper.toEntity(persistence);

    expect(result.logo).toBeNull();
  });
});