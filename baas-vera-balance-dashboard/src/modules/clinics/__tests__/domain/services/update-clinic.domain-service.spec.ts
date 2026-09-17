import { Test, TestingModule } from '@nestjs/testing';
import { UpdateClinicDomainService } from '../../../domain/services/update-clinic.domain-service';
import { ValidateTherapyTypesDomainService } from '../../../domain/services/validate-therapy-types.domain-service';
import { ValidateClinicStatusDomainService } from '../../../domain/services/validate-clinic-status.domain-service';
import {
  MissingClinicAddressError,
  MissingClinicNameError,
  MissingClinicPhoneNumberError,
  MissingClinicUpdatedAtError
} from '../../../domain/errors/clinic.error';
import type { ClinicEntity } from '../../../domain/entities/clinic.entity';

describe('UpdateClinicDomainService', () => {
  let service: UpdateClinicDomainService;
  let validateTherapyTypesDomainService: {
    execute: jest.Mock;
  };
  let validateClinicStatusDomainService: {
    execute: jest.Mock;
  };

  const createExistingClinic = (): ClinicEntity => ({
    id: 'clinic-id',
    name: 'Vera Balance',
    logo: null,
    address: 'Old address',
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
  } as ClinicEntity);

  beforeEach(async () => {
    validateTherapyTypesDomainService = {
      execute: jest.fn()
    };

    validateClinicStatusDomainService = {
      execute: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClinicDomainService,
        {
          provide: ValidateTherapyTypesDomainService,
          useValue: validateTherapyTypesDomainService
        },
        {
          provide: ValidateClinicStatusDomainService,
          useValue: validateClinicStatusDomainService
        }
      ]
    }).compile();

    service = module.get<UpdateClinicDomainService>(UpdateClinicDomainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update all clinic fields', () => {
    const existing = createExistingClinic();

    const therapyTypes = [
      {
        name: 'Terapia familiar',
        icon: ''
      }
    ];

    const result = service.execute(existing, {
      name: 'Vera Balance Updated',
      logo: 'logo.png',
      address: 'New address',
      phoneNumber: '5587654321',
      therapyTypes,
      status: 'inactive',
      updatedAt: '2026-09-15T00:00:00.000Z'
    });

    expect(result.name).toBe('Vera Balance Updated');
    expect(result.logo).toBe('logo.png');
    expect(result.address).toBe('New address');
    expect(result.phoneNumber).toBe('5587654321');
    expect(result.therapyTypes).toEqual(therapyTypes);
    expect(result.status).toBe('inactive');
    expect(result.updatedAt).toBe('2026-09-15T00:00:00.000Z');
  });

  it('should update only provided fields', () => {
    const existing = createExistingClinic();

    const result = service.execute(existing, {
      name: 'Vera Balance Updated',
      updatedAt: '2026-09-15T00:00:00.000Z'
    });

    expect(result.name).toBe('Vera Balance Updated');
    expect(result.logo).toBeNull();
    expect(result.address).toBe('Old address');
    expect(result.phoneNumber).toBe('5512345678');
    expect(result.status).toBe('active');
    expect(result.updatedAt).toBe('2026-09-15T00:00:00.000Z');
  });

  it('should allow logo to be changed to null', () => {
    const existing = createExistingClinic();

    existing.logo = 'logo.png';

    const result = service.execute(existing, {
      logo: null,
      updatedAt: '2026-09-15T00:00:00.000Z'
    });

    expect(result.logo).toBeNull();
  });

  it('should validate therapy types when they are provided', () => {
    const existing = createExistingClinic();

    const therapyTypes = [
      {
        name: 'Terapia familiar',
        icon: ''
      }
    ];

    service.execute(existing, {
      therapyTypes,
      updatedAt: '2026-09-15T00:00:00.000Z'
    });

    expect(validateTherapyTypesDomainService.execute).toHaveBeenCalledTimes(1);
    expect(validateTherapyTypesDomainService.execute).toHaveBeenCalledWith(therapyTypes);
  });

  it('should not validate therapy types when they are not provided', () => {
    const existing = createExistingClinic();

    service.execute(existing, {
      name: 'Vera Balance Updated',
      updatedAt: '2026-09-15T00:00:00.000Z'
    });

    expect(validateTherapyTypesDomainService.execute).not.toHaveBeenCalled();
  });

  it('should validate status when it is provided', () => {
    const existing = createExistingClinic();

    service.execute(existing, {
      status: 'inactive',
      updatedAt: '2026-09-15T00:00:00.000Z'
    });

    expect(validateClinicStatusDomainService.execute).toHaveBeenCalledTimes(1);
    expect(validateClinicStatusDomainService.execute).toHaveBeenCalledWith('inactive');
  });

  it('should not validate status when it is not provided', () => {
    const existing = createExistingClinic();

    service.execute(existing, {
      name: 'Vera Balance Updated',
      updatedAt: '2026-09-15T00:00:00.000Z'
    });

    expect(validateClinicStatusDomainService.execute).not.toHaveBeenCalled();
  });

  it('should throw MissingClinicUpdatedAtError when updatedAt is missing', () => {
    const existing = createExistingClinic();

    expect(() =>
      service.execute(existing, {
        updatedAt: ''
      })
    ).toThrow(MissingClinicUpdatedAtError);
  });

  it('should throw MissingClinicNameError when provided name is empty', () => {
    const existing = createExistingClinic();

    expect(() =>
      service.execute(existing, {
        name: '',
        updatedAt: '2026-09-15T00:00:00.000Z'
      })
    ).toThrow(MissingClinicNameError);
  });

  it('should throw MissingClinicAddressError when provided address is empty', () => {
    const existing = createExistingClinic();

    expect(() =>
      service.execute(existing, {
        address: '',
        updatedAt: '2026-09-15T00:00:00.000Z'
      })
    ).toThrow(MissingClinicAddressError);
  });

  it('should throw MissingClinicPhoneNumberError when provided phone number is empty', () => {
    const existing = createExistingClinic();

    expect(() =>
      service.execute(existing, {
        phoneNumber: '',
        updatedAt: '2026-09-15T00:00:00.000Z'
      })
    ).toThrow(MissingClinicPhoneNumberError);
  });

  it('should propagate therapy types validation errors', () => {
    const existing = createExistingClinic();
    const error = new Error('Invalid therapy types');

    validateTherapyTypesDomainService.execute.mockImplementation(() => {
      throw error;
    });

    expect(() =>
      service.execute(existing, {
        therapyTypes: [
          {
            name: 'Terapia familiar',
            icon: ''
          }
        ],
        updatedAt: '2026-09-15T00:00:00.000Z'
      })
    ).toThrow(error);
  });

  it('should propagate status validation errors', () => {
    const existing = createExistingClinic();
    const error = new Error('Invalid status');

    validateClinicStatusDomainService.execute.mockImplementation(() => {
      throw error;
    });

    expect(() =>
      service.execute(existing, {
        status: 'inactive',
        updatedAt: '2026-09-15T00:00:00.000Z'
      })
    ).toThrow(error);
  });

  it('should return the same clinic entity instance', () => {
    const existing = createExistingClinic();

    const result = service.execute(existing, {
      name: 'Vera Balance Updated',
      updatedAt: '2026-09-15T00:00:00.000Z'
    });

    expect(result).toBe(existing);
  });
});