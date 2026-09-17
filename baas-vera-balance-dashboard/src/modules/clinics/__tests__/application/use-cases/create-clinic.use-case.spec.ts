import { Test, TestingModule } from '@nestjs/testing';
import { CreateClinicUseCase } from '../../../application/use-cases/create-clinic.use-case';
import { CreateClinicDomainService } from '../../../domain/services/create-clinic.domain-service';
import { ValidateTherapyTypesDomainService } from '../../../domain/services/validate-therapy-types.domain-service';
import { CreateClinicDto } from '../../../application/dtos/create-clinic.dto';
import {
  MissingClinicAddressError,
  MissingClinicNameError,
  MissingClinicPhoneNumberError,
  MissingClinicTherapyTypesError,
  MissingTherapyTypeIconError,
  MissingTherapyTypeNameError
} from '../../../domain/errors/clinic.error';

describe('CreateClinicUseCase', () => {
  let useCase: CreateClinicUseCase;

  const mockRepository = {
    create: jest.fn().mockImplementation(entity => Promise.resolve(entity))
  };

  const validDto: CreateClinicDto = {
    name: 'Vera Balance',
    logo: null,
    address: 'Test address',
    phone_number: '5512345678',
    therapy_types: [
      {
        name: 'Terapia individual',
        icon: ''
      }
    ]
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClinicUseCase,
        CreateClinicDomainService,
        ValidateTherapyTypesDomainService,
        {
          provide: 'ICreateClinicRepository',
          useValue: mockRepository
        }
      ]
    }).compile();

    useCase = module.get<CreateClinicUseCase>(CreateClinicUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a clinic successfully', async () => {
    const result = await useCase.execute(validDto);

    expect(result.id).toBeDefined();
    expect(result.name).toBe(validDto.name);
    expect(result.logo).toBe(validDto.logo);
    expect(result.address).toBe(validDto.address);
    expect(result.phone_number).toBe(validDto.phone_number);
    expect(result.therapy_types).toEqual(validDto.therapy_types);
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should create clinic with active status', async () => {
    await useCase.execute(validDto);

    const entity = mockRepository.create.mock.calls[0][0];

    expect(entity.status).toBe('active');
  });

  it('should create clinic with createdAt and updatedAt', async () => {
    await useCase.execute(validDto);

    const entity = mockRepository.create.mock.calls[0][0];

    expect(entity.createdAt).toBeDefined();
    expect(entity.updatedAt).toBeDefined();
  });

  it('should convert therapy type DTOs to plain objects', async () => {
    class TherapyTypeTestDto {
      name = 'Terapia individual';
      icon = '';
    }

    const therapyType = new TherapyTypeTestDto();

    await useCase.execute({
      ...validDto,
      therapy_types: [
        therapyType
      ]
    });

    const entity = mockRepository.create.mock.calls[0][0];

    expect(entity.therapyTypes[0]).toEqual({
      name: 'Terapia individual',
      icon: ''
    });

    expect(entity.therapyTypes[0]).not.toBe(therapyType);
  });

  it('should throw MissingClinicNameError if name is empty', async () => {
    await expect(
      useCase.execute({
        ...validDto,
        name: ''
      })
    ).rejects.toThrow(MissingClinicNameError);
  });

  it('should throw MissingClinicAddressError if address is empty', async () => {
    await expect(
      useCase.execute({
        ...validDto,
        address: ''
      })
    ).rejects.toThrow(MissingClinicAddressError);
  });

  it('should throw MissingClinicPhoneNumberError if phone number is empty', async () => {
    await expect(
      useCase.execute({
        ...validDto,
        phone_number: ''
      })
    ).rejects.toThrow(MissingClinicPhoneNumberError);
  });

  it('should throw MissingClinicTherapyTypesError if therapy types are empty', async () => {
    await expect(
      useCase.execute({
        ...validDto,
        therapy_types: []
      })
    ).rejects.toThrow(MissingClinicTherapyTypesError);
  });

  it('should throw MissingTherapyTypeNameError if therapy type name is empty', async () => {
    await expect(
      useCase.execute({
        ...validDto,
        therapy_types: [
          {
            name: '',
            icon: ''
          }
        ]
      })
    ).rejects.toThrow(MissingTherapyTypeNameError);
  });

  it('should throw MissingTherapyTypeIconError if therapy type icon is missing', async () => {
    await expect(
      useCase.execute({
        ...validDto,
        therapy_types: [
          {
            name: 'Terapia individual',
            icon: undefined as any
          }
        ]
      })
    ).rejects.toThrow(MissingTherapyTypeIconError);
  });
});