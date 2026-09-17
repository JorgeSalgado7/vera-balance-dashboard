import { ValidateTherapyTypesDomainService } from '../../../domain/services/validate-therapy-types.domain-service';
import {
  MissingClinicTherapyTypesError,
  MissingTherapyTypeIconError,
  MissingTherapyTypeNameError
} from '../../../domain/errors/clinic.error';

describe('ValidateTherapyTypesDomainService', () => {
  let service: ValidateTherapyTypesDomainService;

  beforeEach(() => {
    service = new ValidateTherapyTypesDomainService();
  });

  it('should accept valid therapy types', () => {
    expect(() =>
      service.execute([
        {
          name: 'Terapia individual',
          icon: ''
        }
      ])
    ).not.toThrow();
  });

  it('should accept an empty string as therapy type icon', () => {
    expect(() =>
      service.execute([
        {
          name: 'Terapia individual',
          icon: ''
        }
      ])
    ).not.toThrow();
  });

  it('should throw MissingClinicTherapyTypesError when therapy types are empty', () => {
    expect(() =>
      service.execute([])
    ).toThrow(MissingClinicTherapyTypesError);
  });

  it('should throw MissingTherapyTypeNameError when name is missing', () => {
    expect(() =>
      service.execute([
        {
          name: '',
          icon: ''
        }
      ])
    ).toThrow(MissingTherapyTypeNameError);
  });

  it('should throw MissingTherapyTypeIconError when icon is undefined', () => {
    expect(() =>
      service.execute([
        {
          name: 'Terapia individual',
          icon: undefined
        } as never
      ])
    ).toThrow(MissingTherapyTypeIconError);
  });

  it('should throw MissingTherapyTypeIconError when icon is null', () => {
    expect(() =>
      service.execute([
        {
          name: 'Terapia individual',
          icon: null
        } as never
      ])
    ).toThrow(MissingTherapyTypeIconError);
  });
});