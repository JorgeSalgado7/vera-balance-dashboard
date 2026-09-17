import { Test, TestingModule } from '@nestjs/testing';
import { CreateClinicDomainService } from '../../../domain/services/create-clinic.domain-service';
import { ValidateTherapyTypesDomainService } from '../../../domain/services/validate-therapy-types.domain-service';
import {
  MissingClinicAddressError,
  MissingClinicCreatedAtError,
  MissingClinicIdError,
  MissingClinicNameError,
  MissingClinicPhoneNumberError,
  MissingClinicUpdatedAtError
} from '../../../domain/errors/clinic.error';

describe('CreateClinicDomainService', () => {
  let service: CreateClinicDomainService;
  let validateTherapyTypesDomainService: {
    execute: jest.Mock;
  };

  const validData = {
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
    createdAt: '2026-09-14T00:00:00.000Z',
    updatedAt: '2026-09-14T00:00:00.000Z'
  };

  beforeEach(async () => {
    validateTherapyTypesDomainService = {
      execute: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClinicDomainService,
        {
          provide: ValidateTherapyTypesDomainService,
          useValue: validateTherapyTypesDomainService
        }
      ]
    }).compile();

    service = module.get<CreateClinicDomainService>(CreateClinicDomainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a clinic with active status', () => {
    const result = service.execute(validData);

    expect(result.id).toBe(validData.id);
    expect(result.name).toBe(validData.name);
    expect(result.logo).toBe(validData.logo);
    expect(result.address).toBe(validData.address);
    expect(result.phoneNumber).toBe(validData.phoneNumber);
    expect(result.therapyTypes).toEqual(validData.therapyTypes);
    expect(result.status).toBe('active');
    expect(result.createdAt).toBe(validData.createdAt);
    expect(result.updatedAt).toBe(validData.updatedAt);
  });

  it('should validate therapy types', () => {
    service.execute(validData);

    expect(validateTherapyTypesDomainService.execute).toHaveBeenCalledTimes(1);
    expect(validateTherapyTypesDomainService.execute).toHaveBeenCalledWith(validData.therapyTypes);
  });

  it('should allow null logo', () => {
    const result = service.execute({
      ...validData,
      logo: null
    });

    expect(result.logo).toBeNull();
  });

  it('should throw MissingClinicIdError when id is missing', () => {
    expect(() =>
      service.execute({
        ...validData,
        id: ''
      })
    ).toThrow(MissingClinicIdError);

    expect(validateTherapyTypesDomainService.execute).not.toHaveBeenCalled();
  });

  it('should throw MissingClinicNameError when name is missing', () => {
    expect(() =>
      service.execute({
        ...validData,
        name: ''
      })
    ).toThrow(MissingClinicNameError);

    expect(validateTherapyTypesDomainService.execute).not.toHaveBeenCalled();
  });

  it('should throw MissingClinicAddressError when address is missing', () => {
    expect(() =>
      service.execute({
        ...validData,
        address: ''
      })
    ).toThrow(MissingClinicAddressError);

    expect(validateTherapyTypesDomainService.execute).not.toHaveBeenCalled();
  });

  it('should throw MissingClinicPhoneNumberError when phone number is missing', () => {
    expect(() =>
      service.execute({
        ...validData,
        phoneNumber: ''
      })
    ).toThrow(MissingClinicPhoneNumberError);

    expect(validateTherapyTypesDomainService.execute).not.toHaveBeenCalled();
  });

  it('should throw MissingClinicCreatedAtError when createdAt is missing', () => {
    expect(() =>
      service.execute({
        ...validData,
        createdAt: ''
      })
    ).toThrow(MissingClinicCreatedAtError);

    expect(validateTherapyTypesDomainService.execute).not.toHaveBeenCalled();
  });

  it('should throw MissingClinicUpdatedAtError when updatedAt is missing', () => {
    expect(() =>
      service.execute({
        ...validData,
        updatedAt: ''
      })
    ).toThrow(MissingClinicUpdatedAtError);

    expect(validateTherapyTypesDomainService.execute).not.toHaveBeenCalled();
  });

  it('should propagate therapy types validation errors', () => {
    const error = new Error('Invalid therapy types');

    validateTherapyTypesDomainService.execute.mockImplementation(() => {
      throw error;
    });

    expect(() =>
      service.execute(validData)
    ).toThrow(error);
  });
});