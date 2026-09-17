import { Test, TestingModule } from '@nestjs/testing';
import { UpdateClinicUseCase } from '../../../application/use-cases/update-clinic.use-case';
import { UpdateClinicDomainService } from '../../../domain/services/update-clinic.domain-service';
import { ClinicNotFoundError } from '../../../domain/errors/clinic.error';
import type { ClinicEntity } from '../../../domain/entities/clinic.entity';
import type { IFindClinicByIdRepository } from '../../../domain/repositories/find-clinic-by-id.repository';
import type { IUpdateClinicRepository } from '../../../domain/repositories/update-clinic.repository';

describe('UpdateClinicUseCase', () => {
  let useCase: UpdateClinicUseCase;
  let updateClinicDomainService: {
    execute: jest.Mock;
  };
  let findClinicByIdRepository: {
    findById: jest.Mock;
  };
  let updateClinicRepository: {
    update: jest.Mock;
  };

  const existingClinic = {
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
  } as ClinicEntity;

  beforeEach(async () => {
    updateClinicDomainService = {
      execute: jest.fn()
    };

    findClinicByIdRepository = {
      findById: jest.fn()
    };

    updateClinicRepository = {
      update: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClinicUseCase,
        {
          provide: UpdateClinicDomainService,
          useValue: updateClinicDomainService
        },
        {
          provide: 'IFindClinicByIdRepository',
          useValue: findClinicByIdRepository satisfies Partial<IFindClinicByIdRepository>
        },
        {
          provide: 'IUpdateClinicRepository',
          useValue: updateClinicRepository satisfies Partial<IUpdateClinicRepository>
        }
      ]
    }).compile();

    useCase = module.get<UpdateClinicUseCase>(UpdateClinicUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a clinic', async () => {
    const dto = {
      name: 'Vera Balance Updated'
    };

    const updatedClinic = {
      ...existingClinic,
      name: dto.name
    };

    findClinicByIdRepository.findById.mockResolvedValue(existingClinic);
    updateClinicDomainService.execute.mockReturnValue(updatedClinic);
    updateClinicRepository.update.mockResolvedValue(updatedClinic);

    const result = await useCase.execute('clinic-id', dto);

    expect(findClinicByIdRepository.findById).toHaveBeenCalledWith('clinic-id');

    expect(updateClinicDomainService.execute).toHaveBeenCalledWith(
      existingClinic,
      expect.objectContaining({
        name: dto.name
      })
    );

    expect(updateClinicRepository.update).toHaveBeenCalledWith(updatedClinic);

    expect(result).toEqual({
      id: updatedClinic.id,
      name: updatedClinic.name,
      logo: updatedClinic.logo,
      address: updatedClinic.address,
      phone_number: updatedClinic.phoneNumber,
      therapy_types: updatedClinic.therapyTypes
    });
  });

  it('should throw ClinicNotFoundError when clinic does not exist', async () => {
    findClinicByIdRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('clinic-id', {
        name: 'Vera Balance Updated'
      })
    ).rejects.toBeInstanceOf(ClinicNotFoundError);

    expect(updateClinicDomainService.execute).not.toHaveBeenCalled();
    expect(updateClinicRepository.update).not.toHaveBeenCalled();
  });

  it('should convert therapy type DTOs to plain objects', async () => {
    class TherapyTypeTestDto {
      name = 'Terapia familiar';
      icon = '';
    }

    const therapyType = new TherapyTypeTestDto();

    findClinicByIdRepository.findById.mockResolvedValue(existingClinic);
    updateClinicDomainService.execute.mockReturnValue(existingClinic);
    updateClinicRepository.update.mockResolvedValue(existingClinic);

    await useCase.execute('clinic-id', {
      therapy_types: [
        therapyType
      ]
    });

    const updateInput = updateClinicDomainService.execute.mock.calls[0][1];

    expect(updateInput.therapyTypes[0]).toEqual({
      name: therapyType.name,
      icon: therapyType.icon
    });

    expect(updateInput.therapyTypes[0]).not.toBe(therapyType);
  });
});